import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
export class ApplicationOAuthResolver {
  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
  ) {}

  @Mutation(() => ApplicationTokenPairDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async renewApplicationToken(
    @Args('applicationRefreshToken') applicationRefreshToken: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationTokenPairDTO> {
    const applicationRefreshTokenPayload =
      this.applicationTokenService.validateApplicationRefreshToken(
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
