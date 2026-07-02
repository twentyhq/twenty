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

describe('support-ticket-task-creator stress tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.CoreApiClient.mockReturnValue(mocks.client);
    process.env.MULTICA_API_KEY = 'pat-stress';
  });

  it('handles 50 concurrent ticket creations without race conditions', async () => {
    let issueCounter = 0;
    let taskCounter = 0;

    mocks.client.mutation.mockImplementation(async (query: Record<string, unknown>) => {
      if ('createTask' in query) {
        return { createTask: { id: `task-${++taskCounter}` } };
      }
      if ('createTaskTarget' in query) {
        return { createTaskTarget: { id: `tt-${++taskCounter}` } };
      }
      if ('updateXopureSupportTicket' in query) {
        return { updateXopureSupportTicket: { id: 'ok' } };
      }
      return {};
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ id: `multica-issue-${++issueCounter}` }),
        text: async () => '',
      })),
    );

    const tickets = Array.from({ length: 50 }, (_, i) => ({
      record: {
        id: `ticket-${i}`,
        subject: `Stress issue #${i}`,
        status: 'NEW',
        priority: i % 2 === 0 ? 'HIGH' : 'URGENT',
        ticketNumber: `T-${1000 + i}`,
      },
    }));

    const results = await Promise.all(tickets.map((t) => handler(t)));

    // Every invocation succeeded
    expect(results.every((r) => r.success)).toBe(true);
    // Every invocation got a Multica issue ID
    expect(results.every((r) => r.multicaIssueId !== undefined)).toBe(true);
    // Every invocation got a task ID
    expect(results.every((r) => r.taskId !== undefined)).toBe(true);
    // No Multica errors
    expect(results.every((r) => r.multicaError === undefined)).toBe(true);

    // No duplicate issue IDs
    const issueIds = results.map((r) => r.multicaIssueId);
    expect(new Set(issueIds).size).toBe(50);

    // No duplicate task IDs
    const taskIds = results.map((r) => r.taskId);
    expect(new Set(taskIds).size).toBe(50);

    // Correct number of mutations: 50 * 3 (createTask + createTaskTarget + updateTicket)
    expect(mocks.client.mutation).toHaveBeenCalledTimes(150);
    // Correct number of Multica API calls
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(50);
  });

  it('handles mixed idempotent + fresh tickets concurrently', async () => {
    let counter = 0;

    mocks.client.mutation.mockImplementation(async (query: Record<string, unknown>) => {
      if ('createTask' in query) return { createTask: { id: `task-${++counter}` } };
      if ('createTaskTarget' in query) return { createTaskTarget: { id: `tt-${counter}` } };
      if ('updateXopureSupportTicket' in query) return { updateXopureSupportTicket: { id: 'ok' } };
      return {};
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ id: `multica-${++counter}` }),
        text: async () => '',
      })),
    );

    const tickets = Array.from({ length: 20 }, (_, i) => ({
      record: {
        id: `ticket-${i}`,
        subject: `Mixed ${i}`,
        status: 'NEW',
        priority: 'NORMAL',
        // Half already have multicaIssueId (idempotent skip)
        ...(i % 2 === 0 ? { multicaIssueId: `existing-${i}` } : {}),
      },
    }));

    const results = await Promise.all(tickets.map((t) => handler(t)));

    expect(results.every((r) => r.success)).toBe(true);

    // Even-indexed tickets kept their existing issue IDs
    for (let i = 0; i < 20; i += 2) {
      expect(results[i].multicaIssueId).toBe(`existing-${i}`);
    }

    // Odd-indexed tickets got new issue IDs from Multica
    for (let i = 1; i < 20; i += 2) {
      expect(results[i].multicaIssueId).toMatch(/^multica-/);
      expect(results[i].multicaError).toBeUndefined();
    }

    // Only 10 fetch calls (odd-indexed tickets only)
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(10);
    // Only 10 updateXopureSupportTicket mutations (odd-indexed only)
    // Total: 20 createTask + 20 createTaskTarget + 10 updateXopureSupportTicket = 50
    expect(mocks.client.mutation).toHaveBeenCalledTimes(50);
  });

  it('survives partial Multica API failures across concurrent batch', async () => {
    let counter = 0;
    let taskCounter = 0;

    mocks.client.mutation.mockImplementation(async (query: Record<string, unknown>) => {
      if ('createTask' in query) return { createTask: { id: `task-${++taskCounter}` } };
      if ('createTaskTarget' in query) return { createTaskTarget: { id: `tt-${taskCounter}` } };
      if ('updateXopureSupportTicket' in query) return { updateXopureSupportTicket: { id: 'ok' } };
      return {};
    });

    // Every 3rd call fails
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        counter++;
        if (counter % 3 === 0) {
          return { ok: false, status: 503, json: async () => ({}), text: async () => 'Unavailable' };
        }
        return { ok: true, json: async () => ({ id: `multica-${counter}` }), text: async () => '' };
      }),
    );

    const tickets = Array.from({ length: 15 }, (_, i) => ({
      record: { id: `fail-ticket-${i}`, subject: `Fail test ${i}`, status: 'NEW', priority: 'HIGH' },
    }));

    const results = await Promise.all(tickets.map((t) => handler(t)));

    // ALL succeed — task creation never fails even if Multica is down
    expect(results.every((r) => r.success)).toBe(true);
    expect(results.every((r) => r.taskId !== undefined)).toBe(true);

    // Some have multicaIssueId, some have multicaError
    const withIssue = results.filter((r) => r.multicaIssueId !== undefined);
    const withError = results.filter((r) => r.multicaError !== undefined);

    expect(withIssue.length + withError.length).toBe(15);
    // Errors contain the 503 status
    expect(withError.every((r) => r.multicaError!.includes('503'))).toBe(true);
  });
});
