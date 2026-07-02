import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  client: {
    mutation: vi.fn(),
  },
  CoreApiClient: vi.fn(),
  defineLogicFunction: vi.fn((config: unknown) => config),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: mocks.CoreApiClient,
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: mocks.defineLogicFunction,
}));

import { handler } from './support-ticket-task-creator.database-event.logic-function';

describe('support ticket task creator handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.CoreApiClient.mockReturnValue(mocks.client);
    process.env.MULTICA_API_KEY = 'pat-test';
  });

  it('creates a Task, a Multica issue, and writes back the issue id', async () => {
    mocks.client.mutation
      .mockResolvedValueOnce({ createTask: { id: 'task-1' } })
      .mockResolvedValueOnce({ createTaskTarget: { id: 'task-target-1' } })
      .mockResolvedValueOnce({ updateXopureSupportTicket: { id: 'ticket-1' } });

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: 'multica-issue-1', identifier: 'X0-99' }),
      text: async () => '',
    })) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler({
      record: {
        id: 'ticket-1',
        subject: 'Broken shipment',
        status: 'NEW',
        priority: 'HIGH',
        ticketNumber: 'T-100',
      },
    });

    expect(result).toMatchObject({
      success: true,
      taskId: 'task-1',
      supportTicketId: 'ticket-1',
      multicaIssueId: 'multica-issue-1',
    });
    expect(result.multicaError).toBeUndefined();

    // 3 mutations: createTask, createTaskTarget, updateXopureSupportTicket
    expect(mocks.client.mutation).toHaveBeenCalledTimes(3);
    expect(mocks.client.mutation).toHaveBeenNthCalledWith(3, {
      updateXopureSupportTicket: {
        __args: {
          id: 'ticket-1',
          data: { multicaIssueId: 'multica-issue-1' },
        },
        id: true,
      },
    });

    // Multica API called with correct workspace + project
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('workspace_id=d11337e4-0c4e-43b8-8fc8-8216c70f1427'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer pat-test',
          'Content-Type': 'application/json',
        },
      }),
    );
    const callBody = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as RequestInit)?.body as string,
    );
    expect(callBody).toMatchObject({
      title: 'Broken shipment',
      priority: 'high',
      status: 'todo',
      project_id: 'fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6',
    });
  });

  it('skips Multica sync when multicaIssueId is already set (idempotent)', async () => {
    mocks.client.mutation
      .mockResolvedValueOnce({ createTask: { id: 'task-2' } })
      .mockResolvedValueOnce({ createTaskTarget: { id: 'task-target-2' } });

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler({
      record: {
        id: 'ticket-2',
        subject: 'Already synced',
        multicaIssueId: 'existing-issue-id',
      },
    });

    expect(result).toMatchObject({
      success: true,
      taskId: 'task-2',
      multicaIssueId: 'existing-issue-id',
    });
    expect(result.multicaError).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    // Only 2 mutations — no updateXopureSupportTicket write-back
    expect(mocks.client.mutation).toHaveBeenCalledTimes(2);
  });

  it('still creates the Task when the Multica API fails', async () => {
    mocks.client.mutation
      .mockResolvedValueOnce({ createTask: { id: 'task-3' } })
      .mockResolvedValueOnce({ createTaskTarget: { id: 'task-target-3' } });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({}),
        text: async () => 'Service unavailable',
      })) as unknown as typeof fetch,
    );

    const result = await handler({
      record: {
        id: 'ticket-3',
        subject: 'Multica is down',
      },
    });

    expect(result).toMatchObject({
      success: true,
      taskId: 'task-3',
      supportTicketId: 'ticket-3',
    });
    expect(result.multicaIssueId).toBeUndefined();
    expect(result.multicaError).toContain('503');
  });

  it('links created tasks through targetXopureSupportTicketId', async () => {
    mocks.client.mutation
      .mockResolvedValueOnce({ createTask: { id: 'task-1' } })
      .mockResolvedValueOnce({ createTaskTarget: { id: 'task-target-1' } })
      .mockResolvedValueOnce({ updateXopureSupportTicket: { id: 'ticket-1' } });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ id: 'multica-issue-1' }),
        text: async () => '',
      })) as unknown as typeof fetch,
    );

    const result = await handler({
      record: {
        id: 'ticket-1',
        subject: 'Broken shipment',
      },
    });

    expect(result).toMatchObject({
      success: true,
      taskId: 'task-1',
      supportTicketId: 'ticket-1',
    });
    expect(mocks.client.mutation).toHaveBeenNthCalledWith(2, {
      createTaskTarget: {
        __args: {
          data: {
            taskId: 'task-1',
            targetXopureSupportTicketId: 'ticket-1',
          },
        },
        id: true,
      },
    });
  });
});
