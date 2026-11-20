import { type McpRegistryServer } from './mcp-registry-server.type';

export type McpConnectorDirectoryEntry = {
  server: McpRegistryServer;
  _meta: {
    'com.anthropic.api/mcp-registry'?: {
      displayName?: string;
      oneLiner?: string;
      author?: { url?: string };
    };
  };
};
