import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { MCP_DATABASE_CRUD_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-database-crud-tool-annotations.constant';
import { MCP_DESTRUCTIVE_WRITE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-destructive-write-tool-annotations.constant';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export const getMcpRegistryToolAnnotations = ({
  executionRef,
  isDestructive,
  isReadOnly,
}: Pick<
  ToolIndexEntry,
  'executionRef' | 'isDestructive' | 'isReadOnly'
>): McpToolAnnotations => {
  if (executionRef.kind === 'database_crud') {
    return MCP_DATABASE_CRUD_TOOL_ANNOTATIONS[executionRef.operation];
  }

  if (isReadOnly) {
    return MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS;
  }

  return isDestructive
    ? MCP_DESTRUCTIVE_WRITE_TOOL_ANNOTATIONS
    : MCP_EXECUTE_TOOL_ANNOTATIONS;
};
