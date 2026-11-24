import * as fs from 'fs';
import * as path from 'path';
import isEqual from 'lodash.isequal';
import * as prettier from 'prettier';
import semver from 'semver';
import { z } from 'zod';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { BUNDLED_MCP_SERVERS } from 'src/engine/core-modules/application/application-bundled/mcp-servers/constants/bundled-mcp-servers.constant';

import {
  MCP_CONNECTOR_DIRECTORY_API_URL,
  MCP_REGISTRY_API_URL,
} from './constants/mcp-catalog-sources.constant';
import { mcpConnectorDirectoryEntrySchema } from './types/mcp-connector-directory-entry.schema';
import { type McpConnectorDirectoryEntry } from './types/mcp-connector-directory-entry.type';
import { mcpRegistryServerSchema } from './types/mcp-registry-server.schema';
import { buildBundledMcpServer } from './utils/build-bundled-mcp-server.util';

const CATALOG_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'src',
  'engine',
  'core-modules',
  'application',
  'application-bundled',
  'mcp-servers',
  'bundled-mcp-servers.json',
);

const INITIAL_VERSION = '1.0.0';

const registryResponseSchema = z.object({ server: mcpRegistryServerSchema });

const connectorDirectoryPageSchema = z.object({
  servers: z.array(mcpConnectorDirectoryEntrySchema),
  metadata: z.object({ nextCursor: z.string().nullish() }).nullish(),
});

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

const fetchJson = async <TSchema extends z.ZodTypeAny>({
  url,
  schema,
}: {
  url: string;
  schema: TSchema;
}): Promise<z.infer<TSchema> | undefined> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return schema.parse(await response.json());
};

const fetchConnectorDirectory = async (): Promise<
  McpConnectorDirectoryEntry[]
> => {
  const entries: McpConnectorDirectoryEntry[] = [];
  let cursor: string | undefined;

  do {
    const page = await fetchJson({
      url: isDefined(cursor)
        ? `${MCP_CONNECTOR_DIRECTORY_API_URL}&cursor=${encodeURIComponent(cursor)}`
        : MCP_CONNECTOR_DIRECTORY_API_URL,
      schema: connectorDirectoryPageSchema,
    });

    entries.push(...(page?.servers ?? []));
    cursor = isNonEmptyArray(page?.servers)
      ? (page.metadata?.nextCursor ?? undefined)
      : undefined;
  } while (isDefined(cursor));

  return entries;
};

const main = async () => {
  const committedMcpServers = BUNDLED_MCP_SERVERS;
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

      const registryResponse = await fetchJson({
        url: `${MCP_REGISTRY_API_URL}/${encodeURIComponent(registryName)}/versions/latest`,
        schema: registryResponseSchema,
      });
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

      const mcpServer = buildBundledMcpServer({
        registryServer,
        directoryEntry,
      });

      if (!isDefined(mcpServer)) {
        throw new Error(
          `${registryName} has no remote that can be added in one click`,
        );
      }

      if (!isDefined(committedMcpServer)) {
        return { ...mcpServer, version: INITIAL_VERSION };
      }

      const { version: committedVersion, ...committedContent } =
        committedMcpServer;

      if (isEqual(mcpServer, committedContent)) {
        return { ...mcpServer, version: committedVersion };
      }

      const bumpedVersion = semver.inc(committedVersion, 'patch');

      if (!isDefined(bumpedVersion)) {
        throw new Error(
          `${registryName} changed but its committed version "${committedVersion}" is not valid semver`,
        );
      }

      // Workspaces only upgrade an installed app when its version increases
      return { ...mcpServer, version: bumpedVersion };
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
