import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';

// Directory reviews (ChatGPT) hold overwrite and delete tools not flagged destructive, even when undoable
export const MCP_DESTRUCTIVE_WRITE_TOOL_ANNOTATIONS: McpToolAnnotations = {
  ...MCP_EXECUTE_TOOL_ANNOTATIONS,
  destructiveHint: true,
};
