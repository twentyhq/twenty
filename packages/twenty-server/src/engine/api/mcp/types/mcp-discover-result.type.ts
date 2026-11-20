import { type MCP_META_KEYS } from 'src/engine/api/mcp/constants/mcp-meta-keys.constant';
import { type MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';

export type McpDiscoverResult = {
  supportedVersions: string[];
  capabilities: Record<
    'tools' | 'resources' | 'prompts',
    { listChanged: boolean }
  >;
  instructions: string;
  _meta: { [MCP_META_KEYS.serverInfo]: typeof MCP_SERVER_INFO };
};
