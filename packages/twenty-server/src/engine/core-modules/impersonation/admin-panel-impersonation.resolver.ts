import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ImpersonateDTO } from 'src/engine/core-modules/admin-panel/dtos/impersonate.dto';
import { ImpersonateInput } from 'src/engine/core-modules/admin-panel/dtos/impersonate.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { ServerLevelImpersonateGuard } from 'src/engine/guards/server-level-impersonate.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';

// Cross-workspace impersonation lives in the admin schema so it shares the admin host and Access checks.
@AdminResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class AdminPanelImpersonationResolver {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: false,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    }),
    ServerLevelImpersonateGuard,
    NoPermissionGuard,
  )
  @Mutation(() => ImpersonateDTO)
  async impersonateFromAdminPanel(
    @Args() { workspaceId, userId: toImpersonateUserId }: ImpersonateInput,
    @AuthUserWorkspaceId() impersonatorUserWorkspaceId: string,
  ): Promise<ImpersonateDTO> {
    return await this.impersonationService.impersonate(
      toImpersonateUserId,
      workspaceId,
      impersonatorUserWorkspaceId,
    );
  }
}
