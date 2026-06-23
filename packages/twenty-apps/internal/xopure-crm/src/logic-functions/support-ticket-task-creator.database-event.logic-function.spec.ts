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
    mocks.client.mutation
      .mockResolvedValueOnce({ createTask: { id: 'task-1' } })
      .mockResolvedValueOnce({ createTaskTarget: { id: 'task-target-1' } });
  });

  it('links created tasks through targetXopureSupportTicketId', async () => {
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
    expect(mocks.client.mutation).toHaveBeenCalledTimes(2);
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
