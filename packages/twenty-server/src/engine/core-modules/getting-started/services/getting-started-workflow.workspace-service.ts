import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { EmailOperation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import {
  GettingStartedException,
  GettingStartedExceptionCode,
} from 'src/engine/core-modules/getting-started/getting-started.exception';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import {
  GETTING_STARTED_HANDOVER_WORKFLOW_USER_VAR_KEY,
  type GettingStartedKeyValueTypeMap,
} from 'src/engine/core-modules/getting-started/types/getting-started-key-value-type-map.type';
import { buildHandoverWorkflow } from 'src/engine/core-modules/getting-started/utils/build-handover-workflow.util';
import { getWorkflowStepConnectedAccountIds } from 'src/engine/core-modules/getting-started/utils/get-workflow-step-connected-account-ids.util';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

@Injectable()
export class GettingStartedWorkflowWorkspaceService {
  constructor(
    private readonly userVarsService: UserVarsService<GettingStartedKeyValueTypeMap>,
    private readonly cacheLockService: CacheLockService,
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationWorkspaceService: CoreWorkflowMutationWorkspaceService,
    private readonly coreWorkflowLifecycleWorkspaceService: CoreWorkflowLifecycleWorkspaceService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly gettingStartedService: GettingStartedService,
  ) {}

  async prepareWorkflow({
    userId,
    workspaceId,
    userWorkspaceId,
    activate,
  }: {
    userId: string;
    workspaceId: string;
    userWorkspaceId: string;
    activate: boolean;
  }): Promise<GettingStartedWorkflowDTO> {
    return this.cacheLockService.withLock(
      async () => {
        const savedWorkflow = await this.userVarsService.get({
          workspaceId,
          key: GETTING_STARTED_HANDOVER_WORKFLOW_USER_VAR_KEY,
        });

        const savedCoreWorkflow = isDefined(savedWorkflow)
          ? await this.coreWorkflowListService.findOneById({
              workspaceId,
              userWorkspaceId,
              coreWorkflowId: savedWorkflow.workflowId,
            })
          : null;

        const workflow = isDefined(savedCoreWorkflow)
          ? savedWorkflow
          : await this.createWorkflowDraftOrThrow({
              workspaceId,
              userWorkspaceId,
            });

        if (!activate) {
          return workflow;
        }

        const isWorkflowActive =
          savedCoreWorkflow?.statuses.includes(WorkflowStatus.ACTIVE) ?? false;

        if (!isWorkflowActive) {
          await this.assertConnectedAccountsAreUsableByCallerOrThrow({
            workspaceId,
            userWorkspaceId,
            coreWorkflowVersionId: workflow.versionId,
          });

          await this.coreWorkflowLifecycleWorkspaceService.activateCoreWorkflowVersion(
            {
              workspaceId,
              userWorkspaceId,
              coreWorkflowVersionId: workflow.versionId,
            },
          );
        }

        await this.gettingStartedService.completeStep({
          userId,
          workspaceId,
          step: GettingStartedStep.HANDOVER_DEALS,
        });

        return workflow;
      },
      `getting-started-handover-workflow:${workspaceId}`,
      { ttl: 30_000 },
    );
  }

  // The draft is shared by the workspace, so whoever turns it on must be allowed
  // to use every connected account it acts from
  private async assertConnectedAccountsAreUsableByCallerOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<void> {
    const [coreWorkflowVersion, usableConnectedAccounts] = await Promise.all([
      this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionId,
      }),
      this.connectedAccountMetadataService.findUsableByCaller({
        workspaceId,
        userWorkspaceId,
      }),
    ]);

    const usableConnectedAccountIds = usableConnectedAccounts.map(
      (connectedAccount) => connectedAccount.id,
    );

    const hasConnectedAccountNotUsableByCaller =
      getWorkflowStepConnectedAccountIds({
        steps: coreWorkflowVersion?.steps ?? [],
      }).some(
        (connectedAccountId) =>
          !usableConnectedAccountIds.includes(connectedAccountId),
      );

    if (hasConnectedAccountNotUsableByCaller) {
      throw new GettingStartedException(
        `Workflow version ${coreWorkflowVersionId} uses a connected account user workspace ${userWorkspaceId} cannot use`,
        GettingStartedExceptionCode.MAILBOX_NOT_USABLE,
      );
    }
  }

  private async createWorkflowDraftOrThrow({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<GettingStartedWorkflowDTO> {
    const mailboxes =
      await this.connectedAccountMetadataService.findMailboxesUsableByCaller({
        workspaceId,
        userWorkspaceId,
        operation: EmailOperation.SEND,
      });

    const mailbox = mailboxes.find(
      (usableMailbox) => usableMailbox.scope === 'USER',
    );

    if (!isDefined(mailbox)) {
      throw new GettingStartedException(
        `No mailbox can send the workflow emails for user workspace ${userWorkspaceId}`,
        GettingStartedExceptionCode.MAILBOX_NOT_CONNECTED,
      );
    }

    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const handoverWorkflow = buildHandoverWorkflow({
      connectedAccountId: mailbox.id,
      companyIdFieldId: findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.company.fields.id.universalIdentifier,
      }).id,
      memberIdFieldId: findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.fields.id.universalIdentifier,
      }).id,
      opportunityStageFieldId: findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
      }).id,
    });

    const { coreWorkflow, coreWorkflowVersionId } =
      await this.coreWorkflowMutationWorkspaceService.createWorkflowWithContent(
        {
          workspaceId,
          userWorkspaceId,
          ...handoverWorkflow,
        },
      );

    const workflow = {
      workflowId: coreWorkflow.id,
      versionId: coreWorkflowVersionId,
    };

    await this.userVarsService.set({
      workspaceId,
      key: GETTING_STARTED_HANDOVER_WORKFLOW_USER_VAR_KEY,
      value: workflow,
    });

    return workflow;
  }
}
