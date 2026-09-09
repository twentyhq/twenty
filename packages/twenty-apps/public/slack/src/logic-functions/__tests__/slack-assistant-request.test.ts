import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { slackAssistantRequestHandler } from 'src/logic-functions/slack-assistant-request';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

const { enqueueSlackAssistantRequestMock, slackAssistantWorkerHandlerMock } =
  vi.hoisted(() => ({
    enqueueSlackAssistantRequestMock: vi.fn(),
    slackAssistantWorkerHandlerMock: vi.fn(),
  }));

vi.mock('src/logic-functions/utils/enqueue-slack-assistant-request', () => ({
  enqueueSlackAssistantRequest: enqueueSlackAssistantRequestMock,
}));

vi.mock('src/logic-functions/handlers/slack-assistant-worker-handler', () => ({
  slackAssistantWorkerHandler: slackAssistantWorkerHandlerMock,
}));

const EVENT_BODY = { type: 'event_callback' } as SlackEventsRequestBody;

const PENDING_REQUEST = {
  id: 'request-1',
  status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
  slackChannelId: 'D123',
  slackMessageTimestamp: '1700000000.000100',
  requestText: 'how many open deals does Acme have?',
};

describe('slackAssistantRequestHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    slackAssistantWorkerHandlerMock.mockResolvedValue({ done: true });
  });

  it('should answer the request it just recorded in the same execution', async () => {
    enqueueSlackAssistantRequestMock.mockResolvedValue({
      ok: true,
      request: PENDING_REQUEST,
    });

    const result = await slackAssistantRequestHandler(EVENT_BODY);

    expect(enqueueSlackAssistantRequestMock).toHaveBeenCalledExactlyOnceWith(
      EVENT_BODY,
    );
    expect(slackAssistantWorkerHandlerMock).toHaveBeenCalledExactlyOnceWith(
      PENDING_REQUEST,
    );
    expect(result).toEqual({ done: true });
  });

  it('should stop at the enqueue result when no request was recorded', async () => {
    enqueueSlackAssistantRequestMock.mockResolvedValue({
      ok: true,
      skipped: 'Slack message is already queued',
    });

    const result = await slackAssistantRequestHandler(EVENT_BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Slack message is already queued',
    });
    expect(slackAssistantWorkerHandlerMock).not.toHaveBeenCalled();
  });
});
