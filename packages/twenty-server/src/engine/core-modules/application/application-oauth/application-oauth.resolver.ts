import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { GenerateApplicationTokenInput } from 'src/engine/core-modules/application/application-development/dtos/generate-application-token.input';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

const APP_TOKEN_RATE_LIMIT_MAX = 30;
const APP_TOKEN_RATE_LIMIT_WINDOW_MS = 30_000;

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ApplicationOAuthResolver {
  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @Mutation(() => ApplicationTokenPairDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async generateApplicationToken(
    @Args() { applicationId }: GenerateApplicationTokenInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser({ allowUndefined: true }) user?: { id: string },
    @AuthUserWorkspaceId({ allowUndefined: true }) userWorkspaceId?: string,
  ): Promise<ApplicationTokenPairDTO> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `app-dev:${workspaceId}:${applicationId}`,
      1,
      APP_TOKEN_RATE_LIMIT_MAX,
      APP_TOKEN_RATE_LIMIT_WINDOW_MS,
    );

    return this.applicationTokenService.generateApplicationTokenPair({
      workspaceId,
      applicationId,
      userId: user?.id,
      userWorkspaceId,
    });
  }

  @Mutation(() => ApplicationTokenPairDTO)
  @UseGuards(NoPermissionGuard)
  async renewApplicationToken(
    @Args('applicationRefreshToken') applicationRefreshToken: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationTokenPairDTO> {
    const applicationRefreshTokenPayload =
      await this.applicationTokenService.validateApplicationRefreshToken(
        applicationRefreshToken,
      );

    if (applicationRefreshTokenPayload.workspaceId !== workspaceId) {
      throw new ApplicationException(
        'Refresh token workspace does not match authenticated workspace',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    return this.applicationTokenService.renewApplicationTokens(
      applicationRefreshTokenPayload,
    );
  }
}
