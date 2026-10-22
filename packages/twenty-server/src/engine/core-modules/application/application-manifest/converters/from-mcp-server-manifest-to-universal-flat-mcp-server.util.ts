import { type McpServerManifest } from 'twenty-shared/application';

import { type UniversalFlatMcpServer } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-mcp-server.type';

// Tools are fetched after the sync lands, so the manifest never carries a tool list
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
  authorizationHeaderValue: null,
  isEnabled: true,
  tools: [],
  toolsSyncedAt: null,
  toolsSyncError: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});
