import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';

// Not flagged destructive: clients would prompt on every call, and writes are gated by role anyway
export const MCP_EXECUTE_TOOL_ANNOTATIONS: McpToolAnnotations = {
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
};
