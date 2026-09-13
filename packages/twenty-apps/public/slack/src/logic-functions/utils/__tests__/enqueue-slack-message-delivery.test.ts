import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_DELIVER_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueSlackMessageDelivery } from 'src/logic-functions/utils/enqueue-slack-message-delivery';

const { enqueueJobsMock } = vi.hoisted(() => ({ enqueueJobsMock: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: enqueueJobsMock }));

const MESSAGE = {
  slackChannelId: 'C0123456789',
  messageText: 'here is your answer',
};

describe('enqueueSlackMessageDelivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should schedule the first retry at the delay Slack asked for', async () => {
    await enqueueSlackMessageDelivery({
      payload: MESSAGE,
      retryAfterSeconds: 3,
    });

    expect(enqueueJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        SLACK_DELIVER_MESSAGE_UNIVERSAL_IDENTIFIER,
      payloads: [{ ...MESSAGE, attempt: 1 }],
      delayMs: 3000,
    });
  });

  it('should count attempts across the chain so it cannot reschedule forever', async () => {
    await enqueueSlackMessageDelivery({
      payload: { ...MESSAGE, attempt: 2 },
      retryAfterSeconds: 1,
    });

    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({ payloads: [{ ...MESSAGE, attempt: 3 }] }),
    );
  });
});
