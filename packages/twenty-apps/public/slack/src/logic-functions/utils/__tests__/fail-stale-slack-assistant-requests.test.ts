import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_TIMEOUT_TEXT } from 'src/logic-functions/constants/slack-assistant-timeout-text';
import { failStaleSlackAssistantRequests } from 'src/logic-functions/utils/fail-stale-slack-assistant-requests';

const findStaleSlackAssistantRequestsMock = vi.hoisted(() => vi.fn());
const updateSlackAssistantRequestMock = vi.hoisted(() => vi.fn());
const slackPostMessageHandlerMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/data/find-stale-slack-assistant-requests', () => ({
  findStaleSlackAssistantRequests: findStaleSlackAssistantRequestsMock,
}));

vi.mock('src/logic-functions/data/update-slack-assistant-request', () => ({
  updateSlackAssistantRequest: updateSlackAssistantRequestMock,
}));

vi.mock('src/logic-functions/handlers/slack-post-message-handler', () => ({
  slackPostMessageHandler: slackPostMessageHandlerMock,
}));

const buildStaleRequest = (overrides: Record<string, unknown> = {}) => ({
  id: 'request-1',
  slackChannelId: 'C123',
  slackThreadTimestamp: '',
  slackMessageTimestamp: '1700000000.000100',
  ...overrides,
});

describe('failStaleSlackAssistantRequests', () => {
  beforeEach(() => {
    findStaleSlackAssistantRequestsMock.mockResolvedValue([]);
    updateSlackAssistantRequestMock.mockResolvedValue(undefined);
    slackPostMessageHandlerMock.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should look for requests left processing past the worker timeout', async () => {
    await failStaleSlackAssistantRequests();

    const [, queryArgs] = findStaleSlackAssistantRequestsMock.mock.calls[0];
    const cutoffMilliseconds = Date.parse(queryArgs.updatedBefore);

    expect(Date.now() - cutoffMilliseconds).toBeGreaterThanOrEqual(300 * 1000);
    expect(queryArgs.limit).toBeGreaterThan(0);
  });

  it('should fail each stale request with a timeout reason', async () => {
    findStaleSlackAssistantRequestsMock.mockResolvedValue([
      buildStaleRequest(),
      buildStaleRequest({ id: 'request-2' }),
    ]);

    const result = await failStaleSlackAssistantRequests();

    expect(result).toEqual({ sweptCount: 2 });
    expect(updateSlackAssistantRequestMock).toHaveBeenCalledTimes(2);
    expect(updateSlackAssistantRequestMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        id: 'request-1',
        status: 'FAILED',
        errorMessage: expect.stringContaining('timeout'),
      }),
    );
  });

  it('should tell the requester in the thread of their message', async () => {
    findStaleSlackAssistantRequestsMock.mockResolvedValue([
      buildStaleRequest(),
    ]);

    await failStaleSlackAssistantRequests();

    expect(slackPostMessageHandlerMock).toHaveBeenCalledExactlyOnceWith({
      slackChannelId: 'C123',
      messageText: SLACK_ASSISTANT_TIMEOUT_TEXT,
      parentMessageTimestamp: '1700000000.000100',
    });
  });

  it('should reply into an existing thread when the request had one', async () => {
    findStaleSlackAssistantRequestsMock.mockResolvedValue([
      buildStaleRequest({ slackThreadTimestamp: '1699999999.000001' }),
    ]);

    await failStaleSlackAssistantRequests();

    expect(slackPostMessageHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parentMessageTimestamp: '1699999999.000001',
      }),
    );
  });

  it('should still fail the request when the Slack notice cannot be posted', async () => {
    findStaleSlackAssistantRequestsMock.mockResolvedValue([
      buildStaleRequest(),
    ]);
    slackPostMessageHandlerMock.mockRejectedValue(new Error('Slack is down'));

    const result = await failStaleSlackAssistantRequests();

    expect(result).toEqual({ sweptCount: 1 });
    expect(updateSlackAssistantRequestMock).toHaveBeenCalledTimes(1);
  });

  it('should skip the Slack notice when the record has no channel', async () => {
    findStaleSlackAssistantRequestsMock.mockResolvedValue([
      buildStaleRequest({ slackChannelId: undefined }),
    ]);

    await failStaleSlackAssistantRequests();

    expect(updateSlackAssistantRequestMock).toHaveBeenCalledTimes(1);
    expect(slackPostMessageHandlerMock).not.toHaveBeenCalled();
  });
});
