import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_AGENT_BUDGET_SECONDS } from 'src/logic-functions/constants/slack-assistant-agent-budget-seconds';
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
      { agentDeadlineAtMs: expect.any(Number) },
    );
    expect(result).toEqual({ done: true });
  });

  it('should count the agent budget from the start of the execution', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00.000Z'));
    enqueueSlackAssistantRequestMock.mockImplementation(async () => {
      vi.advanceTimersByTime(5_000);

      return { ok: true, request: PENDING_REQUEST };
    });

    await slackAssistantRequestHandler(EVENT_BODY);

    expect(slackAssistantWorkerHandlerMock).toHaveBeenCalledWith(
      PENDING_REQUEST,
      {
        agentDeadlineAtMs:
          new Date('2026-09-09T12:00:00.000Z').getTime() +
          SLACK_ASSISTANT_AGENT_BUDGET_SECONDS * 1000,
      },
    );

    vi.useRealTimers();
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
