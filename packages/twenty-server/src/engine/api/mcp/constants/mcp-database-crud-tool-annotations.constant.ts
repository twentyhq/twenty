import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';

const DATABASE_WRITE_TOOL_ANNOTATIONS: McpToolAnnotations = {
  readOnlyHint: false,
  openWorldHint: false,
  destructiveHint: false,
};

const DATABASE_DESTRUCTIVE_TOOL_ANNOTATIONS: McpToolAnnotations = {
  ...DATABASE_WRITE_TOOL_ANNOTATIONS,
  destructiveHint: true,
};

export const MCP_DATABASE_CRUD_TOOL_ANNOTATIONS: Record<
  DatabaseCrudOperation,
  McpToolAnnotations
> = {
  find_many: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  find_one: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  group_by: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  create_one: DATABASE_WRITE_TOOL_ANNOTATIONS,
  create_many: DATABASE_WRITE_TOOL_ANNOTATIONS,
  update_one: DATABASE_DESTRUCTIVE_TOOL_ANNOTATIONS,
  update_many: DATABASE_DESTRUCTIVE_TOOL_ANNOTATIONS,
  upsert_many: DATABASE_DESTRUCTIVE_TOOL_ANNOTATIONS,
  delete_one: DATABASE_WRITE_TOOL_ANNOTATIONS,
  delete_many: DATABASE_WRITE_TOOL_ANNOTATIONS,
  merge_many: DATABASE_DESTRUCTIVE_TOOL_ANNOTATIONS,
};
