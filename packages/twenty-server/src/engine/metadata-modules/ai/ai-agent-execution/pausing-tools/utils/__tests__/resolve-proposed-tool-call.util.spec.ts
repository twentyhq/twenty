import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';

const RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const APPROVAL_BY_OPERATION = {
  create_one: { template: 'recordCreate' },
  update_one: { template: 'recordUpdate' },
  delete_one: { template: 'recordDelete' },
  update_many: undefined,
} as const;

const buildCrudEntry = (
  name: string,
  operation: keyof typeof APPROVAL_BY_OPERATION,
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
  approval: APPROVAL_BY_OPERATION[operation],
});

const EMAIL_BODY = {
  type: 'doc',
  attrs: { schemaVersion: 1 },
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }],
};

const findTool = async (toolName: string) =>
  [
    buildCrudEntry('create_one_opportunity', 'create_one'),
    buildCrudEntry('update_one_opportunity', 'update_one'),
    buildCrudEntry('delete_one_opportunity', 'delete_one'),
    buildCrudEntry('update_many_opportunities', 'update_many'),
    {
      name: 'send_email',
      label: 'Send email',
      description: '',
      category: 'ACTION' as ToolIndexEntry['category'],
      executionRef: { kind: 'static', toolId: 'send_email' },
      approval: { template: 'email', alternativeToolNames: ['draft_email'] },
    } satisfies ToolIndexEntry,
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

  it('proposes an email with a document body the person can edit, or send as a draft', async () => {
    const toolArguments = {
      recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
      subject: 'Renewal',
      body: EMAIL_BODY,
    };

    expect(
      await resolveProposedToolCall({
        input: {
          toolName: 'send_email',
          arguments: toolArguments,
          summary: 'Follow up',
        },
        findTool,
        executeTool: jest.fn(),
      }),
    ).toEqual({
      proposal: {
        toolName: 'send_email',
        toolLabel: 'Send email',
        summary: 'Follow up',
        arguments: toolArguments,
        template: 'email',
        alternativeToolNames: ['draft_email'],
      },
    });
  });

  it('refuses an email whose body is neither a document nor HTML', async () => {
    expect(
      await resolveProposedToolCall({
        input: {
          toolName: 'send_email',
          arguments: {
            recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
            subject: 'Renewal',
            body: { type: 'paragraph' },
          },
          summary: 'Follow up',
        },
        findTool,
        executeTool: jest.fn(),
      }),
    ).toEqual({ error: expect.stringContaining('structured email document') });
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

  it('snapshots when a record to delete was last updated', async () => {
    const executeTool = foundRecord({ updatedAt: '2026-10-01T09:00:00.000Z' });

    const resolution = await resolveProposedToolCall({
      input: {
        toolName: 'delete_one_opportunity',
        arguments: { id: RECORD_ID },
        summary: 'Remove the duplicate',
      },
      findTool,
      executeTool,
    });

    expect(executeTool).toHaveBeenCalledWith({
      toolName: 'find_one_opportunity',
      args: { id: RECORD_ID, select: ['updatedAt'] },
    });
    expect(resolution).toMatchObject({
      proposal: {
        template: 'recordDelete',
        recordId: RECORD_ID,
        currentValues: { updatedAt: '2026-10-01T09:00:00.000Z' },
      },
    });
  });

  it('refuses an update whose fields cannot all be read', async () => {
    expect(
      await resolveProposedToolCall({
        input: {
          toolName: 'update_one_opportunity',
          arguments: { id: RECORD_ID, stage: 'WON', amount: null },
          summary: 'Close the deal',
        },
        findTool,
        executeTool: foundRecord({ stage: 'PROPOSAL' }),
      }),
    ).toEqual({ error: expect.stringContaining('amount') });
  });

  it.each([
    ['create_one_opportunity', { name: 'Acme' }, 'recordCreate'],

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
