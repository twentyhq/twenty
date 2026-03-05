import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { MARKETPLACE_CATALOG_INDEX } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-catalog-index.constant';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/services/marketplace.service';
import { getAdminWorkspaceId } from 'src/engine/core-modules/application/application-marketplace/utils/get-admin-workspace-id.util';

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
          sourceType: ApplicationRegistrationSourceType.NPM,
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
          sourceType: ApplicationRegistrationSourceType.NPM,
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
  private async upsertRegistration(
    params: Pick<
      ApplicationRegistrationEntity,
      | 'universalIdentifier'
      | 'name'
      | 'description'
      | 'author'
      | 'sourceType'
      | 'sourcePackage'
      | 'logoUrl'
      | 'websiteUrl'
      | 'termsUrl'
      | 'latestAvailableVersion'
      | 'isFeatured'
      | 'marketplaceDisplayData'
      | 'ownerWorkspaceId'
    >,
  ): Promise<void> {
    const existing = await this.appRegistrationRepository.findOne({
      where: {
        universalIdentifier: params.universalIdentifier,
      },
    });

    if (isDefined(existing)) {
      await this.appRegistrationRepository.save({
        ...existing,
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
      });

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
