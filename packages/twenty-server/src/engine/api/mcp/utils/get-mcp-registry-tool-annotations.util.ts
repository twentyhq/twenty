import { MCP_DATABASE_CRUD_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-database-crud-tool-annotations.const';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';

export const getMcpRegistryToolAnnotations = (
  executionRef: ToolExecutionRef,
): McpToolAnnotations =>
  executionRef.kind === 'database_crud'
    ? MCP_DATABASE_CRUD_TOOL_ANNOTATIONS[executionRef.operation]
    : MCP_EXECUTE_TOOL_ANNOTATIONS;
