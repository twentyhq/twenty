import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

export type McpToolTarget = {
  name: string;
  mcpServer: Pick<
    FlatMcpServer,
    'id' | 'workspaceId' | 'name' | 'label' | 'url' | 'connectionProviderId'
  >;
  tool: McpServerTool;
};
