import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { UninstallApplicationInput } from 'src/engine/core-modules/application/application-manifest/dtos/uninstall-application.input';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { UpdateApplicationInput } from 'src/engine/core-modules/application/dtos/update-application.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  ApplicationExceptionFilter,
  ApplicationRegistrationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseGuards(WorkspaceAuthGuard)
export class ApplicationInstallResolver {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly marketplaceQueryService: MarketplaceQueryService,
    private readonly metricsService: MetricsService,
  ) {}

  @Query(() => [ApplicationDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async findManyApplications(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationService.findManyApplications(workspaceId);
  }

  @Query(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async findOneApplication(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
    @Args('universalIdentifier', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    universalIdentifier?: string,
  ) {
    return await this.applicationService.findOneApplicationOrThrow({
      id,
      universalIdentifier,
      workspaceId,
    });
  }

  @Mutation(() => Boolean, {
    deprecationReason: 'Use installApplication instead',
  })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async installMarketplaceApp(
    @Args('universalIdentifier') universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.installRegisteredApplication({
      universalIdentifier,
      version,
      workspaceId: workspace.id,
    });

    return true;
  }

  @Mutation(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async installApplication(
    @Args('universalIdentifier') universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    await this.installRegisteredApplication({
      universalIdentifier,
      version,
      workspaceId: workspace.id,
    });

    return this.applicationService.findOneApplicationOrThrow({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }

  private async installRegisteredApplication(params: {
    universalIdentifier: string;
    version: string | undefined;
    workspaceId: string;
  }): Promise<void> {
    const registration =
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        params.universalIdentifier,
      );

    await this.applicationInstallService.installApplication({
      appRegistrationId: registration.id,
      version: params.version,
      workspaceId: params.workspaceId,
    });
  }

  @Mutation(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async updateApplication(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('input') input: UpdateApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationService.findOneApplicationOrThrow({
      id,
      workspaceId,
    });

    return this.applicationService.update(id, {
      ...(isDefined(input.autoUpgrade)
        ? { autoUpgrade: input.autoUpgrade }
        : {}),
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async uninstallApplication(
    @Args() { universalIdentifier }: UninstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier,
        workspaceId,
      },
    );

    const attributes = {
      universal_identifier: universalIdentifier,
      app_name: application?.name ?? 'unknown',
      source_type: application?.sourceType ?? 'unknown',
      version: application?.version ?? 'unknown',
    };

    try {
      await this.applicationSyncService.uninstallApplication({
        applicationUniversalIdentifier: universalIdentifier,
        workspaceId,
      });
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AppUninstallFailed,
        amount: 1,
        attributes: {
          ...attributes,
          error_code:
            error instanceof ApplicationException ? error.code : 'UNKNOWN',
        },
      });

      throw error;
    }

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AppUninstallSucceeded,
      amount: 1,
      attributes,
    });

    return true;
  }
}
