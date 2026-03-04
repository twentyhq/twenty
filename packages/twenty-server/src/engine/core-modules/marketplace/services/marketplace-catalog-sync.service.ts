import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { AppRegistrationSourceType } from 'src/engine/core-modules/application-registration/enums/app-registration-source-type.enum';
import { MARKETPLACE_CATALOG_INDEX } from 'src/engine/core-modules/marketplace/constants/marketplace-catalog-index.constant';
import { MarketplaceService } from 'src/engine/core-modules/marketplace/services/marketplace.service';
import { type MarketplaceDisplayData } from 'src/engine/core-modules/marketplace/types/marketplace-display-data.type';
import { getAdminWorkspaceId } from 'src/engine/core-modules/marketplace/utils/get-admin-workspace-id.util';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  async syncCatalog(): Promise<void> {
    const dataSource = this.appRegistrationRepository.manager.connection;
    const adminWorkspaceId = await getAdminWorkspaceId(dataSource);

    if (!isDefined(adminWorkspaceId)) {
      this.logger.warn(
        'No admin workspace found. Skipping marketplace catalog sync.',
      );

      return;
    }

    await this.syncCuratedApps(adminWorkspaceId);
    await this.syncNpmApps(adminWorkspaceId);

    this.logger.log('Marketplace catalog sync completed');
  }

  private async syncCuratedApps(ownerWorkspaceId: string): Promise<void> {
    for (const entry of MARKETPLACE_CATALOG_INDEX) {
      try {
        await this.upsertRegistration({
          universalIdentifier: entry.universalIdentifier,
          name: entry.name,
          description:
            entry.richDisplayData.aboutDescription ?? entry.description,
          author: entry.author,
          sourceType: AppRegistrationSourceType.NPM,
          sourcePackage: entry.sourcePackage,
          logoUrl: entry.logoUrl ?? null,
          websiteUrl: entry.websiteUrl ?? null,
          termsUrl: entry.termsUrl ?? null,
          latestAvailableVersion: entry.richDisplayData.version ?? null,
          isFeatured: entry.isFeatured,
          marketplaceDisplayData: entry.richDisplayData,
          ownerWorkspaceId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync curated app "${entry.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async syncNpmApps(ownerWorkspaceId: string): Promise<void> {
    const npmApps = await this.marketplaceService.fetchAppsFromNpmRegistry();

    const curatedIdentifiers = new Set(
      MARKETPLACE_CATALOG_INDEX.map((entry) => entry.universalIdentifier),
    );

    for (const app of npmApps) {
      if (curatedIdentifiers.has(app.id)) {
        continue;
      }

      try {
        await this.upsertRegistration({
          universalIdentifier: app.id,
          name: app.name,
          description: app.description,
          author: app.author,
          sourceType: AppRegistrationSourceType.NPM,
          sourcePackage: app.sourcePackage ?? app.name,
          logoUrl: null,
          websiteUrl: app.websiteUrl ?? null,
          termsUrl: null,
          latestAvailableVersion: app.version ?? null,
          isFeatured: false,
          marketplaceDisplayData: null,
          ownerWorkspaceId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync npm app "${app.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  // Lookup by universalIdentifier only (matches the unique constraint).
  // ownerWorkspaceId is only set on insert.
  private async upsertRegistration(params: {
    universalIdentifier: string;
    name: string;
    description: string;
    author: string;
    sourceType: AppRegistrationSourceType;
    sourcePackage: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    termsUrl: string | null;
    latestAvailableVersion: string | null;
    isFeatured: boolean;
    marketplaceDisplayData: MarketplaceDisplayData | null;
    ownerWorkspaceId: string;
  }): Promise<void> {
    const existing = await this.appRegistrationRepository.findOne({
      where: {
        universalIdentifier: params.universalIdentifier,
      },
    });

    if (isDefined(existing)) {
      existing.name = params.name;
      existing.description = params.description;
      existing.author = params.author;
      existing.sourceType = params.sourceType;
      existing.sourcePackage = params.sourcePackage;
      existing.logoUrl = params.logoUrl;
      existing.websiteUrl = params.websiteUrl;
      existing.termsUrl = params.termsUrl;
      existing.latestAvailableVersion = params.latestAvailableVersion;
      existing.isFeatured = params.isFeatured;
      existing.marketplaceDisplayData = params.marketplaceDisplayData;

      await this.appRegistrationRepository.save(existing);

      return;
    }

    const registration = this.appRegistrationRepository.create({
      universalIdentifier: params.universalIdentifier,
      name: params.name,
      description: params.description,
      author: params.author,
      sourceType: params.sourceType,
      sourcePackage: params.sourcePackage,
      logoUrl: params.logoUrl,
      websiteUrl: params.websiteUrl,
      termsUrl: params.termsUrl,
      latestAvailableVersion: params.latestAvailableVersion,
      isFeatured: params.isFeatured,
      marketplaceDisplayData: params.marketplaceDisplayData,
      oAuthClientId: v4(),
      oAuthRedirectUris: [],
      oAuthScopes: [],
      ownerWorkspaceId: params.ownerWorkspaceId,
    });

    await this.appRegistrationRepository.save(registration);
  }
}
