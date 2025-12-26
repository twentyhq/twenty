import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-input.dto';
import { RunWorkflowVersionOutput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-output.dto';
import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Resolver()
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkflowTriggerGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class WorkflowTriggerResolver {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Mutation(() => Boolean)
  async activateWorkflowVersion(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workflowVersionId', { type: () => UUIDScalarType })
    workflowVersionId: string,
  ) {
    return this.workflowTriggerWorkspaceService.activateWorkflowVersion(
      workflowVersionId,
      workspace.id,
    );
  }

  @Mutation(() => Boolean)
  async deactivateWorkflowVersion(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workflowVersionId', { type: () => UUIDScalarType })
    workflowVersionId: string,
  ) {
    return this.workflowTriggerWorkspaceService.deactivateWorkflowVersion(
      workflowVersionId,
      workspace.id,
    );
  }

  @Mutation(() => RunWorkflowVersionOutput)
  async runWorkflowVersion(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input')
    { workflowVersionId, workflowRunId, payload }: RunWorkflowVersionInput,
  ) {
    const authContext = buildSystemAuthContext(workspace.id);

    const workspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return workspaceMemberRepository.findOneOrFail({
            where: {
              userId: user.id,
            },
          });
        },
      );

    return this.workflowTriggerWorkspaceService.runWorkflowVersion({
      workflowVersionId,
      workflowRunId: workflowRunId ?? undefined,
      payload: payload ?? {},
      createdBy: buildCreatedByFromFullNameMetadata({
        fullNameMetadata: {
          firstName: workspaceMember.name.firstName,
          lastName: workspaceMember.name.lastName,
        },
        workspaceMemberId: workspaceMember.id,
      }),
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WorkflowRunDTO)
  async stopWorkflowRun(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workflowRunId', { type: () => UUIDScalarType })
    workflowRunId: string,
  ) {
    return this.workflowTriggerWorkspaceService.stopWorkflowRun(
      workflowRunId,
      workspace.id,
    );
  }
}
