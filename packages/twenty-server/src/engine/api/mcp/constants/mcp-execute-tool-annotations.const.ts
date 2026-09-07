import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';

// execute_tool dispatches every write, deletes included, but flagging it
// destructive makes clients gate each call behind a confirmation prompt. What
// the caller may write is enforced by their role, not by this hint.
export const MCP_EXECUTE_TOOL_ANNOTATIONS: McpToolAnnotations = {
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
};
