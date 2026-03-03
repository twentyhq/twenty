import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ApplicationRegistrationEntity,
  AppRegistrationSourceType,
} from 'src/engine/core-modules/application-registration/application-registration.entity';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/dtos/marketplace-app.dto';
import { ApplicationInstallService } from 'src/engine/core-modules/application/services/application-install.service';
import { AppUpgradeService } from 'src/engine/core-modules/application/services/app-upgrade.service';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/services/marketplace-catalog-sync.service';
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
  private readonly logger = new Logger(MarketplaceResolver.name);
  private hasSyncedOnce = false;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly marketplaceCatalogSyncService: MarketplaceCatalogSyncService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly appUpgradeService: AppUpgradeService,
  ) {}

  @Query(() => [MarketplaceAppDTO])
  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    let registrations = await this.appRegistrationRepository.find({
      where: { sourceType: AppRegistrationSourceType.NPM },
    });

    if (registrations.length === 0 && !this.hasSyncedOnce) {
      this.logger.log(
        'No marketplace registrations found, triggering initial catalog sync',
      );
      this.hasSyncedOnce = true;

      await this.marketplaceCatalogSyncService.syncCatalog();

      registrations = await this.appRegistrationRepository.find({
        where: { sourceType: AppRegistrationSourceType.NPM },
      });
    }

    return registrations
      .map((registration) => this.enrichRegistration(registration))
      .filter(isDefined);
  }

  @Mutation(() => Boolean)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async installMarketplaceApp(
    @Args('universalIdentifier') universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const registration = await this.findOrCreateRegistration({
      universalIdentifier,
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

  private async findOrCreateRegistration(params: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        params.universalIdentifier,
      );

    if (isUuid) {
      const registration = await this.appRegistrationRepository.findOne({
        where: { universalIdentifier: params.universalIdentifier },
      });

      if (isDefined(registration)) {
        return registration;
      }

      throw new Error(
        `No application registration found for identifier "${params.universalIdentifier}"`,
      );
    }

    const packageName = params.universalIdentifier;

    const existingByPackage = await this.appRegistrationRepository.findOne({
      where: { sourcePackage: packageName },
    });

    if (isDefined(existingByPackage)) {
      return existingByPackage;
    }

    this.logger.log(
      `Creating new registration for npm package "${packageName}"`,
    );

    const registration = this.appRegistrationRepository.create({
      universalIdentifier: v4(),
      name: packageName,
      sourceType: AppRegistrationSourceType.NPM,
      sourcePackage: packageName,
      oAuthClientId: v4(),
      oAuthRedirectUris: [],
      oAuthScopes: [],
      workspaceId: params.workspaceId,
    });

    return this.appRegistrationRepository.save(registration);
  }

  private enrichRegistration(
    registration: ApplicationRegistrationEntity,
  ): MarketplaceAppDTO | null {
    const curatedEntry = this.marketplaceCatalogSyncService.getCuratedEntry(
      registration.universalIdentifier,
    );

    if (isDefined(curatedEntry)) {
      return {
        id: registration.universalIdentifier,
        name: curatedEntry.name,
        description: curatedEntry.description,
        author: curatedEntry.author,
        sourcePackage: curatedEntry.sourcePackage,
        websiteUrl: curatedEntry.websiteUrl,
        termsUrl: curatedEntry.termsUrl,
        ...curatedEntry.richDisplayData,
      };
    }

    // Non-curated npm app — return minimal info from the registration
    return {
      id: registration.universalIdentifier,
      name: registration.name,
      description: registration.description ?? '',
      icon: 'IconApps',
      version: registration.latestAvailableVersion ?? '0.0.0',
      author: registration.author ?? 'Unknown',
      category: '',
      screenshots: [],
      aboutDescription: registration.description ?? '',
      providers: [],
      websiteUrl: registration.websiteUrl ?? undefined,
      objects: [],
      fields: [],
      logicFunctions: [],
      frontComponents: [],
      sourcePackage: registration.sourcePackage ?? undefined,
    };
  }
}
