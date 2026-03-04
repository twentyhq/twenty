import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { InstallApplicationInput } from 'src/engine/core-modules/application/dtos/install-application.input';
import { UninstallApplicationInput } from 'src/engine/core-modules/application/dtos/uninstallApplicationInput';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-install/application-sync.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ApplicationInstallResolver {
  constructor(
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

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
      workspaceMigration: {
        actions,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      },
      workspaceId,
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
