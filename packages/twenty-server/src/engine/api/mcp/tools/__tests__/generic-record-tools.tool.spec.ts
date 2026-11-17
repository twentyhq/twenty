import { asSchema } from 'ai';
import { ToolCategory } from 'twenty-shared/ai';

import {
  createGenericRecordTools,
  GENERIC_RECORD_TOOL_NAMES,
} from 'src/engine/api/mcp/tools/generic-record-tools.tool';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';

const TOOL_CONTEXT: ToolContext = { workspaceId: 'workspace-id' };

const setup = () => {
  const resolveAndExecuteDatabaseCrud = jest
    .fn()
    .mockResolvedValue({ success: true, message: 'ok' });
  const tools = createGenericRecordTools({
    toolRegistry: { resolveAndExecuteDatabaseCrud },
    context: TOOL_CONTEXT,
  });

  const call = ({
    toolName,
    toolArguments,
  }: {
    toolName: string;
    toolArguments: Record<string, unknown>;
  }) =>
    executeToolFromToolSet(
      tools,
      toolName,
      toolArguments,
      ToolCategory.DATABASE_CRUD,
    );

  return { tools, call, resolveAndExecuteDatabaseCrud };
};

describe('createGenericRecordTools', () => {
  it('should expose the same tools whatever the workspace', () => {
    expect(GENERIC_RECORD_TOOL_NAMES).toEqual([
      'find_records',
      'group_records',
      'create_records',
      'update_record',
      'update_records',
      'upsert_records',
      'delete_records',
      'merge_records',
    ]);
  });

  it('should take the object as a free string so the schema names no workspace object', async () => {
    const { tools } = setup();

    for (const tool of Object.values(tools)) {
      const schema = await asSchema(tool.inputSchema).jsonSchema;

      expect(schema.properties?.objectName).toMatchObject({ type: 'string' });
      expect(JSON.stringify(schema)).not.toContain('"enum":["compan');
    }
  });

  it('should mark reads read-only and writes as writes', () => {
    const { tools } = setup();

    expect(tools.find_records.annotations.readOnlyHint).toBe(true);
    expect(tools.group_records.annotations.readOnlyHint).toBe(true);
    expect(tools.create_records.annotations.readOnlyHint).toBe(false);
    expect(tools.delete_records.annotations.readOnlyHint).toBe(false);
  });

  it.each([
    [
      'find_records',
      {
        objectName: 'companies',
        select: ['id'],
        filter: { name: { ilike: '%acme%' } },
        limit: 5,
      },
      'find_many',
      { name: { ilike: '%acme%' }, select: ['id'], limit: 5 },
    ],
    [
      'group_records',
      {
        objectName: 'opportunity',
        groupBy: [{ stage: true }],
        filter: { closeDate: { is: 'NOT_NULL' } },
      },
      'group_by',
      { closeDate: { is: 'NOT_NULL' }, groupBy: [{ stage: true }], limit: 50 },
    ],
    [
      'create_records',
      { objectName: 'company', records: [{ name: 'Acme' }] },
      'create_many',
      { records: [{ name: 'Acme' }] },
    ],
    [
      'update_record',
      {
        objectName: 'company',
        id: '20202020-0000-4000-8000-000000000001',
        data: { name: 'Acme' },
      },
      'update_one',
      { id: '20202020-0000-4000-8000-000000000001', name: 'Acme' },
    ],
    [
      'update_records',
      {
        objectName: 'company',
        filter: { name: { eq: 'Acme' } },
        data: { employees: 3 },
      },
      'update_many',
      { filter: { name: { eq: 'Acme' } }, data: { employees: 3 } },
    ],
    [
      'upsert_records',
      { objectName: 'company', records: [{ name: 'Acme' }] },
      'upsert_many',
      { records: [{ name: 'Acme' }] },
    ],
    [
      'delete_records',
      { objectName: 'company', filter: { id: { in: ['a'] } } },
      'delete_many',
      { filter: { id: { in: ['a'] } } },
    ],
    [
      'merge_records',
      {
        objectName: 'company',
        ids: [
          '20202020-0000-4000-8000-000000000001',
          '20202020-0000-4000-8000-000000000002',
        ],
        conflictPriorityIndex: 0,
        dryRun: true,
      },
      'merge_many',
      {
        ids: [
          '20202020-0000-4000-8000-000000000001',
          '20202020-0000-4000-8000-000000000002',
        ],
        conflictPriorityIndex: 0,
        dryRun: true,
      },
    ],
  ])(
    'should run %s as the matching record operation',
    async (toolName, toolArguments, operation, args) => {
      const { call, resolveAndExecuteDatabaseCrud } = setup();

      await call({ toolName, toolArguments });

      expect(resolveAndExecuteDatabaseCrud).toHaveBeenCalledTimes(1);
      expect(resolveAndExecuteDatabaseCrud).toHaveBeenCalledWith({
        objectName: toolArguments.objectName,
        operation,
        args,
        context: TOOL_CONTEXT,
      });
    },
  );

  it('should cap find_records at ten records when no limit is passed', async () => {
    const { call, resolveAndExecuteDatabaseCrud } = setup();

    await call({
      toolName: 'find_records',
      toolArguments: { objectName: 'company', select: ['id'] },
    });

    expect(resolveAndExecuteDatabaseCrud).toHaveBeenCalledTimes(1);
    expect(resolveAndExecuteDatabaseCrud).toHaveBeenCalledWith(
      expect.objectContaining({ args: { select: ['id'], limit: 10 } }),
    );
  });

  it.each(['limit', 'offset', 'orderBy', 'select'])(
    'should refuse a find_records filter on a field named %s instead of dropping it',
    async (fieldName) => {
      const { call, resolveAndExecuteDatabaseCrud } = setup();

      const output = await call({
        toolName: 'find_records',
        toolArguments: {
          objectName: 'company',
          select: ['id'],
          filter: { [fieldName]: { eq: 1 } },
        },
      });

      expect(output).toMatchObject({
        success: false,
        message: `Cannot filter find_records on "${fieldName}"`,
      });
      expect(resolveAndExecuteDatabaseCrud).not.toHaveBeenCalled();
    },
  );

  it('should refuse arguments that do not match the schema without running anything', async () => {
    const { call, resolveAndExecuteDatabaseCrud } = setup();

    const output = await call({
      toolName: 'update_records',
      toolArguments: { objectName: 'company', data: { name: 'Acme' } },
    });

    expect(output).toMatchObject({
      success: false,
      message: 'Invalid arguments for update_records',
    });
    expect(resolveAndExecuteDatabaseCrud).not.toHaveBeenCalled();
  });
});
