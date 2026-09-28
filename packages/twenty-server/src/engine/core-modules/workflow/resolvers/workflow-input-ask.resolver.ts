import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { AssignInputAskInput } from 'src/engine/core-modules/workflow/dtos/assign-input-ask.input';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';

// The same people who may answer a workflow's questions may hand them to one
// another.
@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkflowInputAskResolver {
  constructor(
    private readonly inputAskWorkspaceService: InputAskWorkspaceService,
    private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService,
  ) {}

  @Mutation(() => Boolean)
  async assignInputAsk(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') { inputAskId, workspaceMemberId }: AssignInputAskInput,
  ): Promise<boolean> {
    const authContext = await this.userWorkspaceAuthContextService.resolve({
      workspaceId,
      userWorkspaceId,
    });

    const isAssigned = await this.inputAskWorkspaceService.assign({
      workspaceId,
      inputAskId,
      assigneeWorkspaceMemberId: workspaceMemberId ?? null,
      authContext,
    });

    if (!isAssigned) {
      throw new NotFoundError('Ask or workspace member not found');
    }

    return true;
  }
}
