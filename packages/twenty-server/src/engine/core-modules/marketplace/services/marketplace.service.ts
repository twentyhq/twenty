import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MarketplaceAppDTO } from 'src/engine/core-modules/marketplace/dtos/marketplace-app.dto';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type NpmSearchResult = {
  objects: Array<{
    package: {
      name: string;
      version: string;
      description?: string;
      keywords?: string[];
      author?: { name?: string };
      links?: { homepage?: string };
    };
  }>;
};

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async fetchAppsFromNpmRegistry(): Promise<MarketplaceAppDTO[]> {
    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');
    const apps: MarketplaceAppDTO[] = [];

    try {
      const response = await fetch(
        `${registryUrl}/-/v1/search?text=keywords:twenty-app&size=250`,
        {
          headers: { 'User-Agent': 'Twenty-Marketplace' },
          signal: AbortSignal.timeout(10_000),
        },
      );

      if (!response.ok) {
        this.logger.warn(`npm search failed: ${response.status}`);

        return apps;
      }

      const results = (await response.json()) as Record<string, unknown>;

      if (!Array.isArray(results.objects)) {
        this.logger.warn('Unexpected npm search response shape');

        return apps;
      }

      for (const result of results.objects as NpmSearchResult['objects']) {
        const { name, version, description, author, links } = result.package;
        const twentyKeyword = (result.package.keywords ?? []).find((keyword) =>
          keyword.startsWith('twenty-uid:'),
        );
        const universalIdentifier = isDefined(twentyKeyword)
          ? twentyKeyword.replace('twenty-uid:', '')
          : name;

        apps.push({
          id: universalIdentifier,
          name,
          description: description ?? '',
          icon: 'IconApps',
          version,
          author: author?.name ?? 'Unknown',
          category: '',
          screenshots: [],
          aboutDescription: description ?? '',
          providers: [],
          websiteUrl: links?.homepage,
          objects: [],
          fields: [],
          logicFunctions: [],
          frontComponents: [],
          sourcePackage: name,
        });
      }
    } catch (error) {
      this.logger.warn(
        `Failed to fetch apps from npm registry: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return apps;
  }
}
