import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationNpmRegistrationService } from 'src/engine/core-modules/application/application-registration/application-npm-registration.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { MARKETPLACE_CATALOG_INDEX } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-catalog-index.constant';
import { type MarketplaceDisplayData } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-display-data.type';
import { type NpmPackument } from 'src/engine/core-modules/application/application-marketplace/types/npm-packument.type';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly marketplaceService: MarketplaceService,
    private readonly applicationNpmRegistrationService: ApplicationNpmRegistrationService,
  ) {}

  async syncCatalog(): Promise<void> {
    await this.syncCuratedApps();
    await this.syncNpmApps();

    this.logger.log('Marketplace catalog sync completed');
  }

  private async syncCuratedApps(): Promise<void> {
    for (const entry of MARKETPLACE_CATALOG_INDEX) {
      try {
        await this.applicationRegistrationService.upsertFromCatalog({
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
          ownerWorkspaceId: null,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync curated app "${entry.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async syncNpmApps(): Promise<void> {
    const npmApps = await this.marketplaceService.fetchAppsFromNpmRegistry();

    const curatedIdentifiers = new Set(
      MARKETPLACE_CATALOG_INDEX.map((entry) => entry.universalIdentifier),
    );

    for (const app of npmApps) {
      if (curatedIdentifiers.has(app.id)) {
        continue;
      }

      try {
        const packageName = app.sourcePackage ?? app.name;

        let isProvenanceVerified = false;
        let provenanceRepositoryUrl: string | null = null;
        let provenanceVerifiedAt: Date | null = null;

        if (app.version) {
          const provenance =
            await this.applicationNpmRegistrationService.fetchProvenanceMetadata(
              packageName,
              app.version,
            );

          if (provenance?.hasProvenance) {
            isProvenanceVerified = true;
            provenanceRepositoryUrl = provenance.repositoryUrl;
            provenanceVerifiedAt = new Date();
          }
        }

        const packument =
          await this.marketplaceService.fetchPackument(packageName);

        const displayData = isDefined(packument)
          ? this.buildDisplayDataFromPackument(packument)
          : null;

        await this.applicationRegistrationService.upsertFromCatalog({
          universalIdentifier: app.id,
          name: app.name,
          description: app.description,
          author: app.author,
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: packageName,
          logoUrl: null,
          websiteUrl: app.websiteUrl ?? null,
          termsUrl: null,
          latestAvailableVersion: app.version ?? null,
          isFeatured: false,
          marketplaceDisplayData: displayData,
          ownerWorkspaceId: null,
          isProvenanceVerified,
          provenanceRepositoryUrl,
          provenanceVerifiedAt,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync npm app "${app.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private buildDisplayDataFromPackument(
    packument: NpmPackument,
  ): MarketplaceDisplayData {
    const repositoryUrl = this.extractRepositoryUrl(packument.repository);

    return {
      readme:
        isDefined(packument.readme) &&
        packument.readme !== 'ERROR: No README data found!'
          ? packument.readme
          : undefined,
      aboutDescription: packument.description,
      providers: isDefined(repositoryUrl) ? [repositoryUrl] : [],
    };
  }

  private extractRepositoryUrl(
    repository?: { type?: string; url?: string } | string,
  ): string | null {
    if (!isDefined(repository)) {
      return null;
    }

    const url =
      typeof repository === 'string' ? repository : repository.url ?? null;

    if (!isDefined(url)) {
      return null;
    }

    return url
      .replace(/^git\+/, '')
      .replace(/\.git$/, '');
  }
}
