import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';

const RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const buildCrudEntry = (
  name: string,
  operation: 'create_one' | 'update_one' | 'delete_one' | 'update_many',
): ToolIndexEntry => ({
  name,
  label: name,
  description: '',
  category: 'DATABASE_CRUD' as ToolIndexEntry['category'],
  executionRef: {
    kind: 'database_crud',
    objectNameSingular: 'opportunity',
    operation,
  },
});

const findTool = async (toolName: string) =>
  [
    buildCrudEntry('create_one_opportunity', 'create_one'),
    buildCrudEntry('update_one_opportunity', 'update_one'),
    buildCrudEntry('delete_one_opportunity', 'delete_one'),
    buildCrudEntry('update_many_opportunities', 'update_many'),
    {
      name: 'http_request',
      label: 'HTTP request',
      description: '',
      category: 'ACTION' as ToolIndexEntry['category'],
      executionRef: { kind: 'static', toolId: 'http_request' },
    } satisfies ToolIndexEntry,
  ].find((entry) => entry.name === toolName);

const foundRecord = (record: Record<string, unknown>) =>
  jest.fn().mockResolvedValue({
    success: true,
    message: 'Found',
    result: { records: [record] },
  });

describe('resolveProposedToolCall', () => {
  it('refuses a tool the proposer cannot call', async () => {
    expect(
      await resolveProposedToolCall({
        input: {
          toolName: 'drop_database',
          arguments: {},
          summary: 'Clean up',
        },
        findTool,
        executeTool: jest.fn(),
      }),
    ).toEqual({ error: expect.stringContaining('not available') });
  });

  it('sends emails to propose_email', async () => {
    expect(
      await resolveProposedToolCall({
        input: { toolName: 'send_email', arguments: {}, summary: 'Follow up' },
        findTool,
        executeTool: jest.fn(),
      }),
    ).toEqual({ error: expect.stringContaining('propose_email') });
  });

  it('snapshots the fields an update changes', async () => {
    const executeTool = foundRecord({ stage: 'PROPOSAL', amount: null });

    const resolution = await resolveProposedToolCall({
      input: {
        toolName: 'update_one_opportunity',
        arguments: { id: RECORD_ID, stage: 'WON', amount: null },
        summary: 'Close the deal',
      },
      findTool,
      executeTool,
    });

    expect(executeTool).toHaveBeenCalledWith({
      toolName: 'find_one_opportunity',
      args: { id: RECORD_ID, select: ['stage', 'amount'] },
    });
    expect(resolution).toEqual({
      proposal: {
        toolName: 'update_one_opportunity',
        toolLabel: 'update_one_opportunity',
        summary: 'Close the deal',
        arguments: { id: RECORD_ID, stage: 'WON', amount: null },
        template: 'recordUpdate',
        objectNameSingular: 'opportunity',
        recordId: RECORD_ID,
        currentValues: { stage: 'PROPOSAL', amount: null },
      },
    });
  });

  it('refuses an update of a record it cannot find', async () => {
    const executeTool = jest.fn().mockResolvedValue({
      success: true,
      message: 'Found 0',
      result: { records: [] },
    });

    expect(
      await resolveProposedToolCall({
        input: {
          toolName: 'update_one_opportunity',
          arguments: { id: RECORD_ID, stage: 'WON' },
          summary: 'Close the deal',
        },
        findTool,
        executeTool,
      }),
    ).toEqual({ error: expect.stringContaining(RECORD_ID) });
  });

  it.each([
    ['without a record id', { stage: 'WON' }],
    ['without a field to change', { id: RECORD_ID }],
  ])('refuses an update %s', async (_description, toolArguments) => {
    expect(
      await resolveProposedToolCall({
        input: {
          toolName: 'update_one_opportunity',
          arguments: toolArguments,
          summary: 'Close the deal',
        },
        findTool,
        executeTool: jest.fn(),
      }),
    ).toHaveProperty('error');
  });

  it.each([
    ['create_one_opportunity', { name: 'Acme' }, 'recordCreate'],
    ['delete_one_opportunity', { id: RECORD_ID }, 'recordDelete'],
    ['update_many_opportunities', { filter: {}, data: {} }, 'generic'],
    ['http_request', { url: 'https://example.com' }, 'generic'],
  ])(
    'picks a template for %s',
    async (toolName, toolArguments, expectedTemplate) => {
      const resolution = await resolveProposedToolCall({
        input: { toolName, arguments: toolArguments, summary: 'Do it' },
        findTool,
        executeTool: foundRecord({ id: RECORD_ID }),
      });

      expect(resolution).toMatchObject({
        proposal: { template: expectedTemplate },
      });
    },
  );
});
