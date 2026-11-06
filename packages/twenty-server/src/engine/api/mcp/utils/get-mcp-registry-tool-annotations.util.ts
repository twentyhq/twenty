import { MCP_DATABASE_CRUD_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-database-crud-tool-annotations.constant';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { MCP_STATIC_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-static-tool-annotations.constant';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';

export const getMcpRegistryToolAnnotations = (
  executionRef: ToolExecutionRef,
): McpToolAnnotations => {
  if (executionRef.kind === 'database_crud') {
    return MCP_DATABASE_CRUD_TOOL_ANNOTATIONS[executionRef.operation];
  }

  const staticToolAnnotations =
    executionRef.kind === 'static'
      ? MCP_STATIC_TOOL_ANNOTATIONS[executionRef.toolId]
      : undefined;

  return staticToolAnnotations ?? MCP_EXECUTE_TOOL_ANNOTATIONS;
};
