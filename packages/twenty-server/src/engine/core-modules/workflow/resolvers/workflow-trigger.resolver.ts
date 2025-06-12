import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-input.dto';
import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Resolver()
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionsGuard(SettingPermissionType.WORKFLOWS),
)
@UseFilters(
  WorkflowTriggerGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class WorkflowTriggerResolver {
  constructor(
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Mutation(() => Boolean)
  async activateWorkflowVersion(
    @Args('workflowVersionId') workflowVersionId: string,
  ) {
    return await this.workflowTriggerWorkspaceService.activateWorkflowVersion(
      workflowVersionId,
    );
  }

  @Mutation(() => Boolean)
  async deactivateWorkflowVersion(
    @Args('workflowVersionId') workflowVersionId: string,
  ) {
    return await this.workflowTriggerWorkspaceService.deactivateWorkflowVersion(
      workflowVersionId,
    );
  }

  @Mutation(() => WorkflowRunDTO)
  async runWorkflowVersion(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUser() user: User,
    @Args('input') { workflowVersionId, payload }: RunWorkflowVersionInput,
  ) {
    return await this.workflowTriggerWorkspaceService.runWorkflowVersion({
      workflowVersionId,
      payload: payload ?? {},
      createdBy: buildCreatedByFromFullNameMetadata({
        fullNameMetadata: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        workspaceMemberId: workspaceMemberId,
      }),
    });
  }
}
