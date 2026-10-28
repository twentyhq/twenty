import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GettingStartedProgressDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-progress.dto';
import { UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedGraphqlApiExceptionFilter } from 'src/engine/core-modules/getting-started/filters/getting-started-graphql-api-exception.filter';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

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
  FeatureFlagGuard(FeatureFlagKey.IS_GETTING_STARTED_ENABLED),
  NoPermissionGuard,
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  GettingStartedGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class GettingStartedResolver {
  constructor(private readonly gettingStartedService: GettingStartedService) {}

  @Query(() => GettingStartedProgressDTO)
  async gettingStartedProgress(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<GettingStartedProgressDTO> {
    return this.gettingStartedService.getProgress({
      userId: user.id,
      userEmail: user.email,
      workspaceId: workspace.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => GettingStartedProgressDTO)
  async updateGettingStarted(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: UpdateGettingStartedInput,
  ): Promise<GettingStartedProgressDTO> {
    return this.gettingStartedService.updateProgress({
      userId: user.id,
      userEmail: user.email,
      workspaceId: workspace.id,
      userWorkspaceId,
      input,
    });
  }
}
