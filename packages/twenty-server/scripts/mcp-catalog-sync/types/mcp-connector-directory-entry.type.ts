import { type McpRegistryServer } from './mcp-registry-server.type';

export type McpConnectorDirectoryEntry = {
  server: McpRegistryServer;
  _meta: {
    'com.anthropic.api/mcp-registry'?: {
      displayName?: string;
      oneLiner?: string;
      toolNames?: string[];
      permissions?: string | null;
      author?: { url?: string };
    };
  };
};
