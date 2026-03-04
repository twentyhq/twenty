import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApplicationInstallService } from 'src/engine/core-modules/application/services/application-install.service';
import { AppUpgradeService } from 'src/engine/core-modules/application/services/app-upgrade.service';
import { MarketplaceAppDTO } from 'src/engine/core-modules/marketplace/dtos/marketplace-app.dto';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/marketplace/services/marketplace-catalog-sync.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver()
@UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class MarketplaceResolver {
  constructor(
    private readonly marketplaceCatalogSyncService: MarketplaceCatalogSyncService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly appUpgradeService: AppUpgradeService,
  ) {}

  @Query(() => [MarketplaceAppDTO])
  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    return this.marketplaceCatalogSyncService.findManyMarketplaceApps();
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async installMarketplaceApp(
    @Args('universalIdentifier') universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const registration =
      await this.marketplaceCatalogSyncService.findRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    return this.applicationInstallService.installApplication({
      appRegistrationId: registration.id,
      version,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async installNpmApp(
    @Args('packageName') packageName: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const registration =
      await this.marketplaceCatalogSyncService.findOrCreateNpmRegistration({
        packageName,
        workspaceId: workspace.id,
      });

    return this.applicationInstallService.installApplication({
      appRegistrationId: registration.id,
      version,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async upgradeApplication(
    @Args('appRegistrationId') appRegistrationId: string,
    @Args('targetVersion') targetVersion: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.appUpgradeService.upgradeApplication({
      appRegistrationId,
      targetVersion,
      workspaceId: workspace.id,
    });
  }
}
