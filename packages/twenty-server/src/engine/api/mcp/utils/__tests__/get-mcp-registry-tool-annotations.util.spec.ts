import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-open-world-read-only-tool-annotations.constant';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { getMcpRegistryToolAnnotations } from 'src/engine/api/mcp/utils/get-mcp-registry-tool-annotations.util';
import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';

describe('getMcpRegistryToolAnnotations', () => {
  it.each<[DatabaseCrudOperation, boolean, boolean]>([
    ['find_many', true, false],
    ['find_one', true, false],
    ['group_by', true, false],
    ['create_one', false, false],
    ['create_many', false, false],
    ['update_one', false, true],
    ['update_many', false, true],
    ['upsert_many', false, true],
    ['delete_one', false, false],
    ['delete_many', false, false],
    ['merge_many', false, true],
  ])(
    'should describe the safety of database operation %p',
    (operation, readOnlyHint, destructiveHint) => {
      expect(
        getMcpRegistryToolAnnotations({
          kind: 'database_crud',
          objectNameSingular: 'person',
          operation,
        }),
      ).toEqual({ readOnlyHint, openWorldHint: false, destructiveHint });
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
