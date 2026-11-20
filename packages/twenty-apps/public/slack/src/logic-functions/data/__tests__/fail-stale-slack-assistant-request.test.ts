import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { failStaleSlackAssistantRequest } from 'src/logic-functions/data/fail-stale-slack-assistant-request';

const NOW = new Date('2026-09-09T12:00:00.000Z');
const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';

const mutationMock = vi.fn();

const client = { mutation: mutationMock };

const fail = () =>
  failStaleSlackAssistantRequest(client, {
    id: REQUEST_ID,
    errorMessage: 'interrupted',
  });

describe('failStaleSlackAssistantRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should only fail a request that is still unfinished and past its lease', async () => {
    mutationMock.mockResolvedValue({
      updateSlackAssistantRequests: [{ id: REQUEST_ID }],
    });

    expect(await fail()).toBe(true);
    expect(mutationMock).toHaveBeenCalledExactlyOnceWith({
      updateSlackAssistantRequests: {
        __args: {
          data: { status: 'FAILED', errorMessage: 'interrupted' },
          filter: {
            and: [
              { id: { eq: REQUEST_ID } },
              { status: { in: ['PENDING', 'PROCESSING'] } },
              {
                updatedAt: {
                  lt: new Date(
                    NOW.getTime() -
                      SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000,
                  ).toISOString(),
                },
              },
            ],
          },
        },
        id: true,
      },
    });
  });

  it('should report that nothing changed when no row matched', async () => {
    mutationMock.mockResolvedValue({ updateSlackAssistantRequests: [] });

    expect(await fail()).toBe(false);
  });
});
