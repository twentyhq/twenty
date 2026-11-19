import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MARKETPLACE_MCP_SERVER_REGISTRY_NAMES } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/constants/marketplace-mcp-server-registry-names.constant';
import { MCP_REGISTRY_API_URL } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/constants/mcp-registry.constant';
import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';
import { type McpRegistryServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/mcp-registry-server.type';
import { fromMcpRegistryServerToMarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/from-mcp-registry-server-to-marketplace-mcp-server.util';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FAILED_FETCH_RETRY_DELAY_MS = 5 * 60 * 1000;

@Injectable()
export class MarketplaceMcpServerCatalogService {
  private readonly logger = new Logger(MarketplaceMcpServerCatalogService.name);
  private cacheByRegistryName = new Map<string, MarketplaceMcpServer>();
  private cacheExpiresAt = 0;
  private pendingRefresh: Promise<void> | null = null;

  async findMany(): Promise<MarketplaceMcpServer[]> {
    if (Date.now() >= this.cacheExpiresAt) {
      this.pendingRefresh ??= this.refresh().finally(() => {
        this.pendingRefresh = null;
      });

      await this.pendingRefresh;
    }

    return [...this.cacheByRegistryName.values()];
  }

  async findOne(
    universalIdentifier: string,
  ): Promise<MarketplaceMcpServer | undefined> {
    return (await this.findMany()).find(
      (marketplaceMcpServer) =>
        marketplaceMcpServer.universalIdentifier ===
        universalIdentifier.toLowerCase(),
    );
  }

  private async refresh(): Promise<void> {
    const fetchedMcpServers = await Promise.all(
      MARKETPLACE_MCP_SERVER_REGISTRY_NAMES.map((registryName) =>
        this.fetchFromRegistry(registryName),
      ),
    );

    // A registry outage keeps the previous entry listed instead of dropping it
    MARKETPLACE_MCP_SERVER_REGISTRY_NAMES.forEach((registryName, index) => {
      const fetchedMcpServer = fetchedMcpServers[index];

      if (isDefined(fetchedMcpServer)) {
        this.cacheByRegistryName.set(registryName, fetchedMcpServer);
      }
    });

    this.cacheExpiresAt =
      Date.now() +
      (fetchedMcpServers.every(isDefined)
        ? CACHE_TTL_MS
        : FAILED_FETCH_RETRY_DELAY_MS);
  }

  private async fetchFromRegistry(
    registryName: string,
  ): Promise<MarketplaceMcpServer | undefined> {
    try {
      const response = await fetch(
        `${MCP_REGISTRY_API_URL}/${encodeURIComponent(registryName)}/versions/latest`,
        { signal: AbortSignal.timeout(15000) },
      );

      if (!response.ok) {
        this.logger.warn(
          `MCP registry returned ${response.status} for ${registryName}`,
        );

        return undefined;
      }

      const { server }: { server: McpRegistryServer } = await response.json();

      return fromMcpRegistryServerToMarketplaceMcpServer(server);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch ${registryName} from the MCP registry: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
  }
}
