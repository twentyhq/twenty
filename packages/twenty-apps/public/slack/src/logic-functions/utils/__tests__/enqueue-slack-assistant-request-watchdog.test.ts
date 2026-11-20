import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { enqueueSlackAssistantRequestWatchdog } from 'src/logic-functions/utils/enqueue-slack-assistant-request-watchdog';

const { enqueueJobsMock } = vi.hoisted(() => ({ enqueueJobsMock: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: enqueueJobsMock }));

const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';

describe('enqueueSlackAssistantRequestWatchdog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should schedule the first check after the answering function can no longer be running', async () => {
    await enqueueSlackAssistantRequestWatchdog({
      slackAssistantRequestId: REQUEST_ID,
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        SLACK_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER,
      payloads: [{ slackAssistantRequestId: REQUEST_ID, attempt: 1 }],
      delayMs: expect.any(Number),
    });
    expect(enqueueJobsMock.mock.calls[0][0].delayMs).toBeGreaterThan(
      SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000,
    );
  });

  it('should count attempts across the chain so it cannot reschedule forever', async () => {
    await enqueueSlackAssistantRequestWatchdog({
      slackAssistantRequestId: REQUEST_ID,
      attempt: 1,
    });

    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        payloads: [{ slackAssistantRequestId: REQUEST_ID, attempt: 2 }],
      }),
    );
  });
});
