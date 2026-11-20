import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';

import {
  MCP_CONNECTOR_DIRECTORY_API_URL,
  MCP_REGISTRY_API_URL,
} from './constants/mcp-catalog-sources.constant';
import { type McpConnectorDirectoryEntry } from './types/mcp-connector-directory-entry.type';
import { type McpRegistryServer } from './types/mcp-registry-server.type';
import { buildMarketplaceMcpServer } from './utils/build-marketplace-mcp-server.util';

const CATALOG_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'src',
  'engine',
  'core-modules',
  'application',
  'application-marketplace',
  'marketplace-mcp-server-catalog',
  'marketplace-mcp-servers.json',
);

// oxlint-disable no-console
const log = console.log;
const warn = console.warn;
// oxlint-enable no-console

const readArguments = (flag: string): string[] =>
  process.argv.flatMap((argument, index) =>
    argument === flag && isDefined(process.argv[index + 1])
      ? [process.argv[index + 1]]
      : [],
  );

const fetchJson = async <TValue>(url: string): Promise<TValue | undefined> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.json() as Promise<TValue>;
};

const fetchConnectorDirectory = async (): Promise<
  McpConnectorDirectoryEntry[]
> => {
  const entries: McpConnectorDirectoryEntry[] = [];
  let cursor: string | undefined;

  do {
    const page = await fetchJson<{
      servers: McpConnectorDirectoryEntry[];
      metadata?: { nextCursor?: string };
    }>(
      isDefined(cursor)
        ? `${MCP_CONNECTOR_DIRECTORY_API_URL}&cursor=${encodeURIComponent(cursor)}`
        : MCP_CONNECTOR_DIRECTORY_API_URL,
    );

    entries.push(...(page?.servers ?? []));
    cursor = isNonEmptyArray(page?.servers)
      ? page.metadata?.nextCursor
      : undefined;
  } while (isDefined(cursor));

  return entries;
};

const main = async () => {
  const committedMcpServers = JSON.parse(
    fs.readFileSync(CATALOG_PATH, 'utf-8'),
  ) as MarketplaceMcpServer[];
  const registryNames = [
    ...new Set([
      ...committedMcpServers.map(({ registryName }) => registryName),
      ...readArguments('--add'),
    ]),
  ];

  // The directory only enriches a listing, so the sync still runs without it
  const connectorDirectory = await fetchConnectorDirectory().catch((error) => {
    warn(`Connector directory unavailable, keeping committed copy: ${error}`);

    return undefined;
  });

  const mcpServers = await Promise.all(
    registryNames.map(async (registryName) => {
      const committedMcpServer = committedMcpServers.find(
        (mcpServer) => mcpServer.registryName === registryName,
      );
      if (!isDefined(connectorDirectory) && isDefined(committedMcpServer)) {
        return committedMcpServer;
      }

      const registryResponse = await fetchJson<{ server: McpRegistryServer }>(
        `${MCP_REGISTRY_API_URL}/${encodeURIComponent(registryName)}/versions/latest`,
      );
      const directoryEntry = connectorDirectory?.find(
        ({ server }) =>
          server.name === registryName ||
          server.remotes?.some(({ url }) =>
            registryResponse?.server.remotes?.some(
              (remote) => remote.url === url,
            ),
          ),
      );
      // Some vendors publish to the connector directory only
      const registryServer = registryResponse?.server ?? directoryEntry?.server;

      if (!isDefined(registryServer)) {
        throw new Error(
          `${registryName} is in neither the MCP registry nor the connector directory`,
        );
      }

      const mcpServer = buildMarketplaceMcpServer({
        registryServer,
        directoryEntry,
      });

      if (!isDefined(mcpServer)) {
        throw new Error(
          `${registryName} has no remote that can be added in one click`,
        );
      }

      return mcpServer;
    }),
  );

  const sortedMcpServers = mcpServers.sort((mcpServerA, mcpServerB) =>
    mcpServerA.label.localeCompare(mcpServerB.label),
  );

  fs.writeFileSync(
    CATALOG_PATH,
    await prettier.format(JSON.stringify(sortedMcpServers), { parser: 'json' }),
  );

  log(`Wrote ${sortedMcpServers.length} MCP servers to ${CATALOG_PATH}`);
};

main().catch((error) => {
  // oxlint-disable-next-line no-console
  console.error('MCP catalog sync failed:', error);
  process.exit(1);
});
