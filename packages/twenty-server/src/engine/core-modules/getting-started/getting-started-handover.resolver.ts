import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { GettingStartedHandoverDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-handover.dto';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { buildHandoverWorkflow } from 'src/engine/core-modules/getting-started/utils/build-handover-workflow.util';

@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
export class GettingStartedHandoverResolver {
  constructor(
    private readonly userVars: UserVarsService<{
      'gettingStarted.handover': GettingStartedHandoverDTO;
    }>,
    private readonly locks: CacheLockService,
    private readonly workflows: CoreWorkflowMutationWorkspaceService,
    private readonly lifecycle: CoreWorkflowLifecycleWorkspaceService,
    private readonly metadata: WorkflowMetadataReadService,
    private readonly progress: GettingStartedService,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly versions: WorkspaceScopedRepository<WorkflowVersionEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly accounts: Repository<ConnectedAccountEntity>,
  ) {}

  @Mutation(() => GettingStartedHandoverDTO)
  async prepareGettingStartedHandover(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('activate', { type: () => Boolean, defaultValue: false })
    activate: boolean,
  ) {
    const scope = { userId: user.id, workspaceId: workspace.id };
    return this.locks.withLock(
      async () => {
        let draft: GettingStartedHandoverDTO | undefined =
          await this.userVars.get({
            ...scope,
            key: 'gettingStarted.handover',
          });
        if (
          draft &&
          !(await this.versions.exists(workspace.id, {
            where: {
              workspaceId: workspace.id,
              coreWorkflowId: draft.workflowId,
            },
          }))
        )
          draft = undefined;
        if (!draft) {
          const account = await this.accounts.findOne({
            where: {
              workspaceId: workspace.id,
              userWorkspaceId,
              provider: In([
                ConnectedAccountProvider.GOOGLE,
                ConnectedAccountProvider.MICROSOFT,
              ]),
              archivedAt: IsNull(),
              authFailedAt: IsNull(),
            },
            order: { createdAt: 'ASC' },
          });
          if (!account)
            throw new BadRequestException(
              'Connect a mailbox before preparing this workflow.',
            );
          const maps = await this.metadata.getFlatEntityMaps(workspace.id);
          const idField = (name: string) =>
            Object.values(
              maps.flatFieldMetadataMaps.byUniversalIdentifier,
            ).find(
              (field) =>
                field?.objectMetadataId === maps.objectIdByNameSingular[name] &&
                field.name === 'id',
            )?.id;
          const companyIdFieldId = idField('company');
          const memberIdFieldId = idField('workspaceMember');
          if (!companyIdFieldId || !memberIdFieldId)
            throw new BadRequestException(
              'This template requires companies and workspace members.',
            );
          const created = await this.workflows.createWorkflowWithContent({
            workspaceId: workspace.id,
            userWorkspaceId,
            name: 'Hand over won deals',
            ...buildHandoverWorkflow({
              connectedAccountId: account.id,
              companyIdFieldId,
              memberIdFieldId,
            }),
          });
          draft = {
            workflowId: created.coreWorkflow.id,
            versionId: created.coreWorkflowVersionId,
          };
          await this.userVars.set({
            ...scope,
            key: 'gettingStarted.handover',
            value: draft,
          });
        }
        if (activate) {
          const activeVersion = await this.versions.findOne(workspace.id, {
            where: {
              workspaceId: workspace.id,
              coreWorkflowId: draft.workflowId,
              status: WorkflowVersionStatus.ACTIVE,
            },
          });
          if (!activeVersion)
            await this.lifecycle.activateCoreWorkflowVersion({
              workspaceId: workspace.id,
              userWorkspaceId,
              coreWorkflowVersionId: draft.versionId,
            });
          await this.progress.completeStep(scope, 'handoverDeals');
        }
        return draft;
      },
      `getting-started-handover:${workspace.id}:${user.id}`,
      { ttl: 30_000 },
    );
  }
}
