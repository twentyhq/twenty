import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';
import { enqueueTeamsAssistantRequestWatchdog } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-watchdog';

const { enqueueJobsMock } = vi.hoisted(() => ({ enqueueJobsMock: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: enqueueJobsMock }));

const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';

describe('enqueueTeamsAssistantRequestWatchdog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should schedule the first check after the answering function can no longer be running', async () => {
    await enqueueTeamsAssistantRequestWatchdog({
      teamsAssistantRequestId: REQUEST_ID,
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        TEAMS_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER,
      payloads: [{ teamsAssistantRequestId: REQUEST_ID, attempt: 1 }],
      delayMs: expect.any(Number),
      retryLimit: 3,
    });
    expect(enqueueJobsMock.mock.calls[0][0].delayMs).toBeGreaterThan(
      TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000,
    );
  });

  it('should count attempts across the chain so it cannot reschedule forever', async () => {
    await enqueueTeamsAssistantRequestWatchdog({
      teamsAssistantRequestId: REQUEST_ID,
      attempt: 1,
    });

    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        payloads: [{ teamsAssistantRequestId: REQUEST_ID, attempt: 2 }],
      }),
    );
  });
});
