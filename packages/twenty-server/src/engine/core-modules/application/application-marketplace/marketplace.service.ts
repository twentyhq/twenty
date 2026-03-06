import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const npmSearchResultSchema = z.object({
  objects: z.array(
    z.object({
      package: z.object({
        name: z.string(),
        version: z.string(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        author: z.object({ name: z.string().optional() }).optional(),
        links: z.object({ homepage: z.string().optional() }).optional(),
      }),
    }),
  ),
});

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async fetchAppsFromNpmRegistry(): Promise<MarketplaceAppDTO[]> {
    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

    try {
      const { data } = await axios.get(
        `${registryUrl}/-/v1/search?text=keywords:twenty-app&size=250`,
        {
          headers: { 'User-Agent': 'Twenty-Marketplace' },
          timeout: 10_000,
        },
      );

      const parsed = npmSearchResultSchema.safeParse(data);

      if (!parsed.success) {
        this.logger.warn(
          `Unexpected npm search response shape: ${parsed.error.message}`,
        );

        return [];
      }

      return parsed.data.objects
        .map((result) => {
          const { name, version, description, author, links } = result.package;
          const twentyKeyword = (result.package.keywords ?? []).find(
            (keyword) => keyword.startsWith('twenty-uid:'),
          );

          if (!isDefined(twentyKeyword)) {
            return null;
          }

          const universalIdentifier = twentyKeyword.replace('twenty-uid:', '');

          return {
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
            isFeatured: false,
          };
        })
        .filter(isDefined);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch apps from npm registry: ${error instanceof Error ? error.message : String(error)}`,
      );

      return [];
    }
  }
}
