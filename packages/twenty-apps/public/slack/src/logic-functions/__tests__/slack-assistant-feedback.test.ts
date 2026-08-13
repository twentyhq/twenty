import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackAssistantFeedbackHandler } from 'src/logic-functions/slack-assistant-feedback';

const { updateSlackAssistantRequestFeedbackMock } = vi.hoisted(() => ({
  updateSlackAssistantRequestFeedbackMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/update-slack-assistant-request-feedback',
  () => ({
    updateSlackAssistantRequestFeedback: updateSlackAssistantRequestFeedbackMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

const REQUEST_ID = '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10';

const buildPayload = ({
  actionId = 'slack-assistant-feedback',
  blockId = REQUEST_ID,
  value = 'positive_feedback',
}: {
  actionId?: string;
  blockId?: string;
  value?: string;
} = {}) => ({
  type: 'block_actions',
  team: { id: 'T0123456789' },
  user: { id: 'U0123456789' },
  actions: [
    {
      type: 'feedback_buttons',
      action_id: actionId,
      block_id: blockId,
      value,
    },
  ],
});

describe('slackAssistantFeedbackHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should store a positive rating on the request record', async () => {
    const result = await slackAssistantFeedbackHandler(buildPayload());

    expect(updateSlackAssistantRequestFeedbackMock).toHaveBeenCalledWith(
      expect.anything(),
      { id: REQUEST_ID, feedbackRating: 'POSITIVE' },
    );
    expect(result).toEqual({ done: true });
  });

  it('should store a negative rating on the request record', async () => {
    const result = await slackAssistantFeedbackHandler(
      buildPayload({ value: 'negative_feedback' }),
    );

    expect(updateSlackAssistantRequestFeedbackMock).toHaveBeenCalledWith(
      expect.anything(),
      { id: REQUEST_ID, feedbackRating: 'NEGATIVE' },
    );
    expect(result).toEqual({ done: true });
  });

  it('should skip payloads without the assistant feedback action', async () => {
    const result = await slackAssistantFeedbackHandler(
      buildPayload({ actionId: 'another-action' }),
    );

    expect(updateSlackAssistantRequestFeedbackMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      reason: 'No assistant feedback action in payload',
    });
  });

  it('should skip feedback actions without a request id', async () => {
    const result = await slackAssistantFeedbackHandler(
      buildPayload({ blockId: '' }),
    );

    expect(updateSlackAssistantRequestFeedbackMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      reason: 'Feedback action has no request id',
    });
  });

  it('should skip feedback actions with an unknown button value', async () => {
    const result = await slackAssistantFeedbackHandler(
      buildPayload({ value: 'something-else' }),
    );

    expect(updateSlackAssistantRequestFeedbackMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      reason: 'Unknown feedback button value: something-else',
    });
  });
});
