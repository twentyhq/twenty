import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/dtos/application-token-pair.dto';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { InstallApplicationInput } from 'src/engine/core-modules/application/dtos/install-application.input';
import { UninstallApplicationInput } from 'src/engine/core-modules/application/dtos/uninstallApplicationInput';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(ApplicationExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ApplicationResolver {
  constructor(
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Query(() => [ApplicationDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findManyApplications(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationService.findManyApplications(workspaceId);
  }

  @Query(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async checkApplicationExist(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
    @Args('universalIdentifier', { type: () => UUIDScalarType, nullable: true })
    universalIdentifier?: string,
  ) {
    return await this.applicationService.checkApplicationExist({
      id,
      universalIdentifier,
      workspaceId,
    });
  }

  @Query(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findOneApplication(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
    @Args('universalIdentifier', { type: () => UUIDScalarType, nullable: true })
    universalIdentifier?: string,
  ) {
    return await this.applicationService.findOneApplicationOrThrow({
      id,
      universalIdentifier,
      workspaceId,
    });
  }

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

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async installApplication(
    @Args() { workspaceMigration: { actions } }: InstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (
      featureFlagsMap[
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED
      ] !== true
    ) {
      throw new ApplicationException(
        'Application installation from tarball is not enabled',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    await this.workspaceMigrationRunnerService.run({
      actions,
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async uninstallApplication(
    @Args() { universalIdentifier }: UninstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationSyncService.uninstallApplication({
      applicationUniversalIdentifier: universalIdentifier,
      workspaceId,
    });

    return true;
  }
}
