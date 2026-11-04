import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-open-world-read-only-tool-annotations.constant';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { getMcpRegistryToolAnnotations } from 'src/engine/api/mcp/utils/get-mcp-registry-tool-annotations.util';
import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';

describe('getMcpRegistryToolAnnotations', () => {
  it.each<[DatabaseCrudOperation]>([['find_many'], ['find_one'], ['group_by']])(
    'should return closed world read-only annotations for the database read operation %p',
    (operation) => {
      expect(
        getMcpRegistryToolAnnotations({
          kind: 'database_crud',
          objectNameSingular: 'person',
          operation,
        }),
      ).toEqual(MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS);
    },
  );

  it.each<[DatabaseCrudOperation]>([
    ['create_one'],
    ['create_many'],
    ['update_one'],
    ['update_many'],
    ['upsert_many'],
    ['delete_one'],
    ['delete_many'],
    ['merge_many'],
  ])(
    'should return execute annotations for the database write operation %p',
    (operation) => {
      expect(
        getMcpRegistryToolAnnotations({
          kind: 'database_crud',
          objectNameSingular: 'person',
          operation,
        }),
      ).toEqual(MCP_EXECUTE_TOOL_ANNOTATIONS);
    },
  );

  it.each<[string, McpToolAnnotations]>([
    ['get_view_fields', MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS],
    ['search_help_center', MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS],
  ])(
    'should return read-only annotations for the static tool %p',
    (toolId, expectedAnnotations) => {
      expect(getMcpRegistryToolAnnotations({ kind: 'static', toolId })).toEqual(
        expectedAnnotations,
      );
    },
  );

  it.each<[ToolExecutionRef]>([
    [{ kind: 'static', toolId: 'create_view_field' }],
    [
      {
        kind: 'logic_function',
        logicFunctionId: '20202020-0000-4000-8000-000000000001',
      },
    ],
  ])('should return execute annotations for %p', (executionRef) => {
    expect(getMcpRegistryToolAnnotations(executionRef)).toEqual(
      MCP_EXECUTE_TOOL_ANNOTATIONS,
    );
  });
});
