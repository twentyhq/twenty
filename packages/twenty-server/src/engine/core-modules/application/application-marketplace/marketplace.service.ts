import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const MAX_REGISTRY_ASSET_SIZE_BYTES = 10 * 1024 * 1024; // 10Mb
const REGISTRY_SEARCH_PAGE_SIZE = 250;
const REGISTRY_SEARCH_MAX_RESULTS = 10_000;
const REGISTRY_SEARCH_MAX_PAGES = Math.ceil(
  REGISTRY_SEARCH_MAX_RESULTS / REGISTRY_SEARCH_PAGE_SIZE,
);

export type RegistryPackageInfo = {
  name: string;
  version: string;
  description: string;
  author: string;
  websiteUrl?: string;
};

const registrySearchResultSchema = z.object({
  objects: z.array(
    z.object({
      package: z.object({
        name: z.string(),
        version: z.string(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        author: z.object({ name: z.string().optional() }).optional(),
        links: z
          .object({
            homepage: z.string().optional(),
            npm: z.string().optional(),
          })
          .optional(),
      }),
    }),
  ),
  total: z.number().optional(),
});

type RegistrySearchResult = z.infer<typeof registrySearchResultSchema>;

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async fetchManifestFromRegistryCdn(
    packageName: string,
    version: string,
  ): Promise<Manifest | null> {
    const cdnBaseUrl = this.twentyConfigService.get('APP_REGISTRY_CDN_URL');
    const url = buildRegistryCdnUrl({
      cdnBaseUrl,
      packageName,
      version,
      filePath: 'manifest.json',
    });

    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Twenty-Marketplace' },
        timeout: 5_000,
      });

      if (!data?.application) {
        return null;
      }

      return data as Manifest;
    } catch {
      this.logger.debug(
        `Could not fetch manifest from CDN for ${packageName}@${version}`,
      );

      return null;
    }
  }

  async fetchAssetFromRegistryCdn(
    packageName: string,
    version: string,
    filePath: string,
  ): Promise<Buffer | null> {
    const cdnBaseUrl = this.twentyConfigService.get('APP_REGISTRY_CDN_URL');
    const url = buildRegistryCdnUrl({
      cdnBaseUrl,
      packageName,
      version,
      filePath,
    });

    try {
      const { data } = await axios.get<ArrayBuffer>(url, {
        headers: { 'User-Agent': 'Twenty-Marketplace' },
        timeout: 10_000,
        responseType: 'arraybuffer',
        maxContentLength: MAX_REGISTRY_ASSET_SIZE_BYTES,
      });

      return Buffer.from(data);
    } catch {
      this.logger.debug(
        `Could not fetch asset "${filePath}" from CDN for ${packageName}@${version}`,
      );

      return null;
    }
  }

  async fetchAppsFromRegistry(): Promise<RegistryPackageInfo[]> {
    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');
    const packageInfoByName = new Map<string, RegistryPackageInfo>();

    for (
      let pageIndex = 0;
      pageIndex < REGISTRY_SEARCH_MAX_PAGES;
      pageIndex++
    ) {
      const from = pageIndex * REGISTRY_SEARCH_PAGE_SIZE;
      const searchResult = await this.fetchRegistrySearchPage(
        registryUrl,
        from,
      );

      if (!isDefined(searchResult)) {
        break;
      }

      const { objects, total } = searchResult;

      for (const result of objects) {
        const { name, version, description, author, links } = result.package;

        if (!packageInfoByName.has(name)) {
          packageInfoByName.set(name, {
            name,
            version,
            description: description ?? '',
            author: author?.name ?? 'Unknown',
            websiteUrl: links?.homepage ?? links?.npm,
          });
        }
      }

      const fetchedCount = from + objects.length;

      if (
        objects.length < REGISTRY_SEARCH_PAGE_SIZE ||
        (isDefined(total) && fetchedCount >= total)
      ) {
        break;
      }

      if (pageIndex === REGISTRY_SEARCH_MAX_PAGES - 1) {
        this.logger.warn(
          `Registry search truncated at ${REGISTRY_SEARCH_MAX_RESULTS} results`,
        );
      }
    }

    return Array.from(packageInfoByName.values());
  }

  private async fetchRegistrySearchPage(
    registryUrl: string,
    from: number,
  ): Promise<RegistrySearchResult | null> {
    try {
      const { data } = await axios.get(
        `${registryUrl}/-/v1/search?text=keywords:twenty-app&size=${REGISTRY_SEARCH_PAGE_SIZE}&from=${from}`,
        {
          headers: { 'User-Agent': 'Twenty-Marketplace' },
          timeout: 10_000,
        },
      );

      const parsed = registrySearchResultSchema.safeParse(data);

      if (!parsed.success) {
        this.logger.warn(
          `Unexpected registry search response shape: ${parsed.error.message}`,
        );

        return null;
      }

      return parsed.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch apps from registry ${registryUrl}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }
}
