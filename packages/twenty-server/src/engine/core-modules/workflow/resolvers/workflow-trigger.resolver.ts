import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { User } from 'src/engine/core-modules/user/user.entity';
import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-input.dto';
import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Resolver()
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionsGuard(PermissionFlagType.WORKFLOWS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkflowTriggerGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class WorkflowTriggerResolver {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Mutation(() => Boolean)
  async activateWorkflowVersion(
    @Args('workflowVersionId', { type: () => UUIDScalarType })
    workflowVersionId: string,
  ) {
    return await this.workflowTriggerWorkspaceService.activateWorkflowVersion(
      workflowVersionId,
    );
  }

  @Mutation(() => Boolean)
  async deactivateWorkflowVersion(
    @Args('workflowVersionId', { type: () => UUIDScalarType })
    workflowVersionId: string,
  ) {
    return await this.workflowTriggerWorkspaceService.deactivateWorkflowVersion(
      workflowVersionId,
    );
  }

  @Mutation(() => WorkflowRunDTO)
  async runWorkflowVersion(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
    @Args('input')
    { workflowVersionId, workflowRunId, payload }: RunWorkflowVersionInput,
  ) {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOneOrFail({
      where: {
        userId: user.id,
      },
    });

    return await this.workflowTriggerWorkspaceService.runWorkflowVersion({
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
    });
  }
}
