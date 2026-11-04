import { UseFilters, UseGuards } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';

import { AdminConsoleLoginTokenDTO } from 'src/engine/core-modules/admin-console/dtos/admin-console-login-token.dto';
import { AdminConsoleSessionService } from 'src/engine/core-modules/admin-console/services/admin-console-session.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthProvider } from 'src/engine/decorators/auth/auth-provider.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class AdminConsoleHandoffResolver {
  constructor(
    private readonly adminConsoleSessionService: AdminConsoleSessionService,
  ) {}

  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: false,
          playground: false,
          workspaceAgnostic: false,
        },
        apiKey: false,
        oauthClient: false,
        application: false,
      },
      requiredPermissionFlags: [],
    }),
  )
  @Mutation(() => AdminConsoleLoginTokenDTO)
  async createAdminConsoleLoginToken(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthProvider() authProvider: AuthProviderEnum,
  ): Promise<AdminConsoleLoginTokenDTO> {
    return this.adminConsoleSessionService.createLoginToken({
      user,
      workspaceId: workspace.id,
      authProvider,
    });
  }
}
