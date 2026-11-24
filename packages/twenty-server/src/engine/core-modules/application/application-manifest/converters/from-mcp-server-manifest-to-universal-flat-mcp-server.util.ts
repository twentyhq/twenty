import {
  type McpServerManifest,
  normalizeMcpServerManifest,
} from 'twenty-shared/application';

import { type UniversalFlatMcpServer } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-mcp-server.type';

export const fromMcpServerManifestToUniversalFlatMcpServer = ({
  mcpServerManifest,
  applicationUniversalIdentifier,
  now,
}: {
  mcpServerManifest: McpServerManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatMcpServer => ({
  universalIdentifier: mcpServerManifest.universalIdentifier,
  applicationUniversalIdentifier,
  name: mcpServerManifest.name,
  label: mcpServerManifest.label,
  url: mcpServerManifest.url,
  connectionProviderUniversalIdentifier:
    normalizeMcpServerManifest(mcpServerManifest)
      .connectionProviderUniversalIdentifier ?? null,
  isActive: true,
  tools: [],
  toolsSyncedAt: null,
  toolsSyncError: null,
  createdAt: now,
  updatedAt: now,
});
