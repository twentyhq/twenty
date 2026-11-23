import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { MCP_DESTRUCTIVE_WRITE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-destructive-write-tool-annotations.constant';
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
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: 'person',
            operation,
          },
        }),
      ).toEqual(MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS);
    },
  );

  it.each<[DatabaseCrudOperation]>([['create_one'], ['create_many']])(
    'should return non-destructive execute annotations for the database write operation %p',
    (operation) => {
      expect(
        getMcpRegistryToolAnnotations({
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: 'person',
            operation,
          },
        }),
      ).toEqual(MCP_EXECUTE_TOOL_ANNOTATIONS);
    },
  );

  it.each<[DatabaseCrudOperation]>([
    ['update_one'],
    ['update_many'],
    ['upsert_many'],
    ['delete_one'],
    ['delete_many'],
    ['merge_many'],
  ])(
    'should flag the database write operation %p as destructive',
    (operation) => {
      expect(
        getMcpRegistryToolAnnotations({
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: 'person',
            operation,
          },
        }),
      ).toEqual(MCP_DESTRUCTIVE_WRITE_TOOL_ANNOTATIONS);
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
  ])(
    'should return non-destructive execute annotations for %p',
    (executionRef) => {
      expect(getMcpRegistryToolAnnotations({ executionRef })).toEqual(
        MCP_EXECUTE_TOOL_ANNOTATIONS,
      );
    },
  );

  it('should return closed world read-only annotations for a non-database tool declared read-only', () => {
    expect(
      getMcpRegistryToolAnnotations({
        executionRef: { kind: 'static', toolId: 'get_view_fields' },
        isReadOnly: true,
      }),
    ).toEqual(MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS);
  });

  it('should flag a non-database tool declared destructive', () => {
    expect(
      getMcpRegistryToolAnnotations({
        executionRef: { kind: 'static', toolId: 'delete_object_metadata' },
        isDestructive: true,
      }),
    ).toEqual(MCP_DESTRUCTIVE_WRITE_TOOL_ANNOTATIONS);
  });
});
