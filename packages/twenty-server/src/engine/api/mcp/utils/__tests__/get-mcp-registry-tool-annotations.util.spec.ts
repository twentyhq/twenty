import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.const';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
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

  it.each<[ToolExecutionRef | undefined]>([
    [{ kind: 'static', toolId: 'get_view_fields' }],
    [
      {
        kind: 'logic_function',
        logicFunctionId: '20202020-0000-4000-8000-000000000001',
      },
    ],
    [undefined],
  ])('should return execute annotations for %p', (executionRef) => {
    expect(getMcpRegistryToolAnnotations(executionRef)).toEqual(
      MCP_EXECUTE_TOOL_ANNOTATIONS,
    );
  });
});
