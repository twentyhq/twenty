import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.const';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';

export const MCP_DATABASE_CRUD_TOOL_ANNOTATIONS: Record<
  DatabaseCrudOperation,
  McpToolAnnotations
> = {
  find_many: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  find_one: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  group_by: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  create_one: MCP_EXECUTE_TOOL_ANNOTATIONS,
  create_many: MCP_EXECUTE_TOOL_ANNOTATIONS,
  update_one: MCP_EXECUTE_TOOL_ANNOTATIONS,
  update_many: MCP_EXECUTE_TOOL_ANNOTATIONS,
  upsert_many: MCP_EXECUTE_TOOL_ANNOTATIONS,
  delete_one: MCP_EXECUTE_TOOL_ANNOTATIONS,
  delete_many: MCP_EXECUTE_TOOL_ANNOTATIONS,
};
