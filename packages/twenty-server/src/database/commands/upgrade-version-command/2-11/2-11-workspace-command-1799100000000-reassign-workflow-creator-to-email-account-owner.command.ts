import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const EMAIL_ACTION_TYPES: WorkflowActionType[] = [
  WorkflowActionType.SEND_EMAIL,
  WorkflowActionType.DRAFT_EMAIL,
];

@RegisteredWorkspaceCommand('2.11.0', 1799100000000)
@Command({
  name: 'upgrade:2-11:reassign-workflow-creator-to-email-account-owner',
  description:
    'Reassign the creator of active workflows whose email steps use a user-visibility connected account owned by another member, so workflow runs can resolve the account through the acting-user access check',
})
export class ReassignWorkflowCreatorToEmailAccountOwnerCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const accountIdsByWorkflowId =
      await this.getEmailStepAccountIdsByWorkflowId(workspaceId);

    if (accountIdsByWorkflowId.size === 0) {
      return;
    }

    const referencedAccountIds = [
      ...new Set([...accountIdsByWorkflowId.values()].flat()),
    ];

    const userVisibilityAccounts = await this.connectedAccountRepository.find({
      where: {
        id: In(referencedAccountIds),
        workspaceId,
        visibility: 'user',
      },
    });

    if (userVisibilityAccounts.length === 0) {
      return;
    }

    const accountById = new Map(
      userVisibilityAccounts.map((account) => [account.id, account]),
    );

    const workflowRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflows = await workflowRepository.find({
      where: { id: In([...accountIdsByWorkflowId.keys()]) },
    });

    const memberByUserWorkspaceId = await this.getMemberByUserWorkspaceId({
      workspaceId,
      userWorkspaceIds: userVisibilityAccounts
        .map((account) => account.userWorkspaceId)
        .filter(isDefined),
    });

    let reassignedCount = 0;

    for (const workflow of workflows) {
      const ownerUserWorkspaceIds = [
        ...new Set(
          (accountIdsByWorkflowId.get(workflow.id) ?? [])
            .map((accountId) => accountById.get(accountId)?.userWorkspaceId)
            .filter(isDefined),
        ),
      ];

      if (ownerUserWorkspaceIds.length === 0) {
        continue;
      }

      if (ownerUserWorkspaceIds.length > 1) {
        this.logger.warn(
          `Workflow ${workflow.id} in workspace ${workspaceId} references user-visibility accounts of ${ownerUserWorkspaceIds.length} different owners; skipping`,
        );
        continue;
      }

      const ownerMember = memberByUserWorkspaceId.get(ownerUserWorkspaceIds[0]);

      if (!isDefined(ownerMember)) {
        this.logger.warn(
          `Workflow ${workflow.id} in workspace ${workspaceId} references an account whose owner has no workspace member; skipping`,
        );
        continue;
      }

      if (workflow.createdBy?.workspaceMemberId === ownerMember.id) {
        continue;
      }

      const ownerFullName =
        `${ownerMember.name?.firstName ?? ''} ${ownerMember.name?.lastName ?? ''}`.trim();

      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Reassigning creator of workflow ${workflow.id} in workspace ${workspaceId} to account owner member ${ownerMember.id}`,
      );

      if (isDryRun) {
        continue;
      }

      await workflowRepository.update(workflow.id, {
        createdBy: {
          ...workflow.createdBy,
          workspaceMemberId: ownerMember.id,
          name: ownerFullName,
        },
      });
      reassignedCount++;
    }

    if (reassignedCount > 0) {
      this.logger.log(
        `Reassigned creator on ${reassignedCount} workflow(s) for workspace ${workspaceId}`,
      );
    }
  }

  private async getEmailStepAccountIdsByWorkflowId(
    workspaceId: string,
  ): Promise<Map<string, string[]>> {
    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const activeVersions = await workflowVersionRepository.find({
      where: { status: WorkflowVersionStatus.ACTIVE },
    });

    const accountIdsByWorkflowId = new Map<string, string[]>();

    for (const version of activeVersions) {
      if (!Array.isArray(version.steps)) {
        continue;
      }

      const accountIds = version.steps
        .filter((step: WorkflowAction) =>
          EMAIL_ACTION_TYPES.includes(step.type),
        )
        .map(
          (step: WorkflowAction) =>
            (step.settings?.input as { connectedAccountId?: string })
              ?.connectedAccountId,
        )
        .filter(
          (accountId): accountId is string =>
            isNonEmptyString(accountId) && isValidUuid(accountId),
        );

      if (accountIds.length === 0) {
        continue;
      }

      accountIdsByWorkflowId.set(version.workflowId, [
        ...(accountIdsByWorkflowId.get(version.workflowId) ?? []),
        ...accountIds,
      ]);
    }

    return accountIdsByWorkflowId;
  }

  private async getMemberByUserWorkspaceId({
    workspaceId,
    userWorkspaceIds,
  }: {
    workspaceId: string;
    userWorkspaceIds: string[];
  }): Promise<Map<string, WorkspaceMemberWorkspaceEntity>> {
    if (userWorkspaceIds.length === 0) {
      return new Map();
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { id: In(userWorkspaceIds), workspaceId },
    });

    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const members = await workspaceMemberRepository.find({
      where: { userId: In(userWorkspaces.map((uw) => uw.userId)) },
    });

    const memberByUserId = new Map(
      members.map((member) => [member.userId, member]),
    );

    return new Map(
      userWorkspaces
        .map(
          (userWorkspace): [string, WorkspaceMemberWorkspaceEntity] | null => {
            const member = memberByUserId.get(userWorkspace.userId);

            return isDefined(member) ? [userWorkspace.id, member] : null;
          },
        )
        .filter(isDefined),
    );
  }
}
