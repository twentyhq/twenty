import { type MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';

export type McpInitializeResult = {
  protocolVersion: string;
  capabilities: Record<
    'tools' | 'resources' | 'prompts',
    { listChanged: boolean }
  >;
  serverInfo: typeof MCP_SERVER_INFO;
  instructions: string;
};
