import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { RequireAccessTokenGuard } from 'src/engine/guards/require-access-token.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

const APPLICATION_TOKEN_RATE_LIMIT_MAX = 30;
const APPLICATION_TOKEN_RATE_LIMIT_WINDOW_MS = 30_000;

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
  ThrottlerGraphqlApiExceptionFilter,
)
@UseGuards(WorkspaceAuthGuard)
export class ApplicationOAuthResolver {
  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @Mutation(() => ApplicationTokenPairDTO)
  @UseGuards(RequireAccessTokenGuard, NoPermissionGuard)
  async renewApplicationToken(
    @Args('applicationRefreshToken') applicationRefreshToken: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationTokenPairDTO> {
    const applicationRefreshTokenPayload =
      await this.applicationTokenService.validateApplicationRefreshTokenForSessionOrThrow(
        {
          applicationRefreshToken,
          workspaceId,
          userId: user.id,
          userWorkspaceId,
        },
      );

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `app-renew:${workspaceId}:${userWorkspaceId}:${applicationRefreshTokenPayload.applicationId}`,
      1,
      APPLICATION_TOKEN_RATE_LIMIT_MAX,
      APPLICATION_TOKEN_RATE_LIMIT_WINDOW_MS,
    );

    return this.applicationTokenService.renewApplicationTokens(
      applicationRefreshTokenPayload,
    );
  }
}
