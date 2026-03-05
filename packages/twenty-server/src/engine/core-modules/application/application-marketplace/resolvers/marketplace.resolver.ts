import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { AppRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/app-registration-source-type.enum';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { AppUpgradeService } from 'src/engine/core-modules/application/application-install/app-upgrade.service';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/services/marketplace-query.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver()
@UseFilters(ApplicationRegistrationExceptionFilter)
@UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class MarketplaceResolver {
  constructor(
    private readonly marketplaceQueryService: MarketplaceQueryService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly appUpgradeService: AppUpgradeService,
  ) {}

  @Query(() => [MarketplaceAppDTO])
  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    return this.marketplaceQueryService.findManyMarketplaceApps();
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
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    if (registration.sourceType !== AppRegistrationSourceType.NPM) {
      throw new ApplicationRegistrationException(
        `Only NPM apps can be installed via the marketplace`,
        ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH,
      );
    }

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
      await this.marketplaceQueryService.findOrCreateNpmRegistration({
        packageName,
        ownerWorkspaceId: workspace.id,
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
