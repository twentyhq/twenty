import {
  isDestructiveMcpServerTool,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  ToolCategory,
} from 'twenty-shared/ai';
import { type McpToolTarget } from 'src/engine/core-modules/tool-provider/types/mcp-tool-target.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const MCP_TOOL_ICON = 'IconSparkles';

export const fromMcpToolTargetToToolIndexEntry = ({
  name,
  mcpServer,
  tool,
}: McpToolTarget): ToolIndexEntry => ({
  name,
  label: tool.annotations?.title ?? tool.name,
  description: [
    tool.description ?? tool.name,
    `(MCP server: ${mcpServer.label})`,
    ...(isDestructiveMcpServerTool(tool)
      ? [
          `It may change data: it only runs once approved through ${PROPOSE_TOOL_CALL_TOOL_NAME}.`,
        ]
      : []),
  ].join(' '),
  category: ToolCategory.MCP,
  executionRef: {
    kind: 'mcp_server_tool',
    mcpServerId: mcpServer.id,
    toolName: tool.name,
  },
  icon: MCP_TOOL_ICON,
});
