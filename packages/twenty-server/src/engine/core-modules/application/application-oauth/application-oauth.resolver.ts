import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';

const APPLICATION_TOKEN_RATE_LIMIT_MAX = 30;
const APPLICATION_TOKEN_RATE_LIMIT_WINDOW_MS = 30_000;

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
)
export class ApplicationOAuthResolver {
  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @Mutation(() => ApplicationTokenPairDTO)
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
    NoPermissionGuard,
  )
  async renewApplicationToken(
    @Args('applicationRefreshToken') applicationRefreshToken: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationTokenPairDTO> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `app-renew:${workspaceId}:${userWorkspaceId}`,
      1,
      APPLICATION_TOKEN_RATE_LIMIT_MAX,
      APPLICATION_TOKEN_RATE_LIMIT_WINDOW_MS,
    );

    const applicationRefreshTokenPayload =
      await this.applicationTokenService.validateApplicationRefreshTokenForSessionOrThrow(
        {
          applicationRefreshToken,
          workspaceId,
          userId: user.id,
          userWorkspaceId,
        },
      );

    return this.applicationTokenService.renewApplicationTokens(
      applicationRefreshTokenPayload,
    );
  }
}
