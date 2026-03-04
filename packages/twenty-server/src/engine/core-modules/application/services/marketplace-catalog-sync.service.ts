import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ApplicationRegistrationEntity,
  AppRegistrationSourceType,
} from 'src/engine/core-modules/application-registration/application-registration.entity';
import {
  MARKETPLACE_CATALOG_INDEX,
  type CuratedAppEntry,
} from 'src/engine/core-modules/application/constants/marketplace-catalog-index.constant';
import { getAdminWorkspaceId } from 'src/engine/core-modules/application/utils/get-admin-workspace-id.util';
import { MarketplaceService } from 'src/engine/core-modules/application/services/marketplace.service';

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

  private async syncCuratedApps(workspaceId: string): Promise<void> {
    for (const entry of MARKETPLACE_CATALOG_INDEX) {
      try {
        await this.upsertRegistration({
          universalIdentifier: entry.universalIdentifier,
          name: entry.name,
          description: entry.description,
          author: entry.author,
          sourceType: AppRegistrationSourceType.NPM,
          sourcePackage: entry.sourcePackage,
          logoUrl: entry.logoUrl ?? null,
          websiteUrl: entry.websiteUrl ?? null,
          termsUrl: entry.termsUrl ?? null,
          latestAvailableVersion: entry.richDisplayData.version ?? null,
          workspaceId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync curated app "${entry.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async syncNpmApps(workspaceId: string): Promise<void> {
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
          workspaceId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync npm app "${app.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

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
    workspaceId: string;
  }): Promise<void> {
    const existing = await this.appRegistrationRepository.findOne({
      where: {
        universalIdentifier: params.universalIdentifier,
        workspaceId: params.workspaceId,
      },
    });

    if (isDefined(existing)) {
      await this.appRegistrationRepository.update(existing.id, {
        name: params.name,
        description: params.description,
        author: params.author,
        sourceType: params.sourceType,
        sourcePackage: params.sourcePackage,
        logoUrl: params.logoUrl,
        websiteUrl: params.websiteUrl,
        termsUrl: params.termsUrl,
        latestAvailableVersion: params.latestAvailableVersion,
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
      oAuthClientId: v4(),
      oAuthRedirectUris: [],
      oAuthScopes: [],
      workspaceId: params.workspaceId,
    });

    await this.appRegistrationRepository.save(registration);
  }

  getCuratedEntry(universalIdentifier: string): CuratedAppEntry | undefined {
    return MARKETPLACE_CATALOG_INDEX.find(
      (entry) => entry.universalIdentifier === universalIdentifier,
    );
  }
}
