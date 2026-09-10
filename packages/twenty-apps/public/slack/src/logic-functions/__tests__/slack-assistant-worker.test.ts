import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { slackAssistantWorkerHandler } from 'src/logic-functions/slack-assistant-worker';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';

const {
  callLog,
  coreApiClientMock,
  updateSlackAssistantRequestMock,
  fetchSlackAssistantContextMock,
  fetchWorkspaceBaseUrlsMock,
  resolveSlackRunAsForRequestMock,
  runSlackAssistantAgentWithDeadlineMock,
  slackPostMessageHandlerMock,
  startSlackAssistantStatusUpdatesMock,
  stopStatusUpdatesMock,
  finishSlackAssistantRequestWithFailureMock,
  setSlackAssistantThreadTitleMock,
  subscribeSlackThreadMock,
} = vi.hoisted(() => ({
  callLog: [] as string[],
  coreApiClientMock: vi.fn(),
  updateSlackAssistantRequestMock: vi.fn(),
  fetchSlackAssistantContextMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
  resolveSlackRunAsForRequestMock: vi.fn(),
  runSlackAssistantAgentWithDeadlineMock: vi.fn(),
  slackPostMessageHandlerMock: vi.fn(),
  startSlackAssistantStatusUpdatesMock: vi.fn(),
  stopStatusUpdatesMock: vi.fn(),
  finishSlackAssistantRequestWithFailureMock: vi.fn(),
  setSlackAssistantThreadTitleMock: vi.fn(),
  subscribeSlackThreadMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/update-slack-assistant-request', () => ({
  updateSlackAssistantRequest: updateSlackAssistantRequestMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-assistant-context', () => ({
  fetchSlackAssistantContext: fetchSlackAssistantContextMock,
}));

vi.mock('src/logic-functions/utils/fetch-workspace-base-urls', () => ({
  fetchWorkspaceBaseUrls: fetchWorkspaceBaseUrlsMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-run-as-for-request', () => ({
  resolveSlackRunAsForRequest: resolveSlackRunAsForRequestMock,
}));

vi.mock(
  'src/logic-functions/utils/run-slack-assistant-agent-with-deadline',
  () => ({
    runSlackAssistantAgentWithDeadline: runSlackAssistantAgentWithDeadlineMock,
  }),
);

vi.mock('src/logic-functions/handlers/slack-post-message-handler', () => ({
  slackPostMessageHandler: slackPostMessageHandlerMock,
  postSlackMessageWithPreviewScope: slackPostMessageHandlerMock,
}));

vi.mock(
  'src/logic-functions/utils/start-slack-assistant-status-updates',
  () => ({
    startSlackAssistantStatusUpdates: startSlackAssistantStatusUpdatesMock,
  }),
);

vi.mock(
  'src/logic-functions/utils/finish-slack-assistant-request-with-failure',
  () => ({
    finishSlackAssistantRequestWithFailure:
      finishSlackAssistantRequestWithFailureMock,
  }),
);

vi.mock('src/logic-functions/utils/set-slack-assistant-thread-title', () => ({
  setSlackAssistantThreadTitle: setSlackAssistantThreadTitleMock,
}));

vi.mock('src/logic-functions/utils/subscribe-slack-thread', () => ({
  subscribeSlackThread: subscribeSlackThreadMock,
}));

const REQUEST_RECORD: SlackAssistantRequestRecord = {
  id: 'request-1',
  status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
  slackChannelId: 'D123',
  slackChannelType: 'im',
  slackThreadTimestamp: '',
  slackMessageTimestamp: '1700000000.000100',
  slackUserId: 'U123',
  requestText: 'how many open deals does Acme have?',
};

const SLACK_CONTEXT = {
  conversationMessages: [],
  requesterName: 'Ada',
  requesterIdentity: undefined,
  requestMessage: undefined,
  threadMessages: [],
  slackClient: undefined,
  assistantBotUserId: undefined,
  isDirectMessage: true,
};

type SlackAssistantRequestCreatedEvent = Parameters<
  typeof slackAssistantWorkerHandler
>[0];

const buildEvent = (
  record: SlackAssistantRequestRecord = REQUEST_RECORD,
): SlackAssistantRequestCreatedEvent =>
  ({
    name: 'slackAssistantRequest.created',
    workspaceId: 'workspace-1',
    objectMetadata: { nameSingular: 'slackAssistantRequest' },
    properties: { after: record },
  }) as SlackAssistantRequestCreatedEvent;

describe('slackAssistantWorkerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callLog.length = 0;

    coreApiClientMock.mockImplementation(function () {
      return {};
    });
    updateSlackAssistantRequestMock.mockResolvedValue(undefined);
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://acme.twenty.com']);
    resolveSlackRunAsForRequestMock.mockResolvedValue(undefined);
    setSlackAssistantThreadTitleMock.mockResolvedValue(undefined);
    subscribeSlackThreadMock.mockResolvedValue(undefined);

    startSlackAssistantStatusUpdatesMock.mockImplementation(() => {
      callLog.push('status:start');

      return stopStatusUpdatesMock;
    });
    stopStatusUpdatesMock.mockImplementation(async () => {
      callLog.push('status:stop');
    });
    fetchSlackAssistantContextMock.mockImplementation(async () => {
      callLog.push('context:fetch');

      return SLACK_CONTEXT;
    });
    runSlackAssistantAgentWithDeadlineMock.mockImplementation(async () => {
      callLog.push('agent:run');

      return { success: true, error: null, result: { response: 'Two.' } };
    });
    slackPostMessageHandlerMock.mockImplementation(async () => {
      callLog.push('reply:answer');

      return { success: true, slackTs: '1700000000.000200' };
    });
    finishSlackAssistantRequestWithFailureMock.mockImplementation(
      async ({ errorMessage }: { errorMessage: string }) => {
        callLog.push('reply:failure');

        return { failed: true, reason: errorMessage };
      },
    );
  });

  it('should show the thinking status before fetching the Slack context', async () => {
    await slackAssistantWorkerHandler(buildEvent());

    expect(callLog).toEqual([
      'status:start',
      'context:fetch',
      'agent:run',
      'status:stop',
      'reply:answer',
    ]);
    expect(
      startSlackAssistantStatusUpdatesMock,
    ).toHaveBeenCalledExactlyOnceWith({
      slackChannelId: REQUEST_RECORD.slackChannelId,
      threadTimestamp: REQUEST_RECORD.slackMessageTimestamp,
    });
  });

  it('should stop the status before the failure reply when the context lookup throws', async () => {
    fetchSlackAssistantContextMock.mockImplementation(async () => {
      callLog.push('context:fetch');

      throw new Error('Slack is unreachable');
    });

    const result = await slackAssistantWorkerHandler(buildEvent());

    expect(result).toEqual({ failed: true, reason: 'Slack is unreachable' });
    expect(callLog).toEqual([
      'status:start',
      'context:fetch',
      'status:stop',
      'reply:failure',
    ]);
    expect(runSlackAssistantAgentWithDeadlineMock).not.toHaveBeenCalled();
  });

  it('should stop the status before the failure reply when the agent fails', async () => {
    runSlackAssistantAgentWithDeadlineMock.mockImplementation(async () => {
      callLog.push('agent:run');

      return { success: false, error: 'Agent crashed', result: null };
    });

    const result = await slackAssistantWorkerHandler(buildEvent());

    expect(result).toEqual({ failed: true, reason: 'Agent crashed' });
    expect(callLog).toEqual([
      'status:start',
      'context:fetch',
      'agent:run',
      'status:stop',
      'reply:failure',
    ]);
    expect(stopStatusUpdatesMock).toHaveBeenCalledOnce();
  });

  it('should not start the status for a request that is no longer pending', async () => {
    const result = await slackAssistantWorkerHandler(
      buildEvent({
        ...REQUEST_RECORD,
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
      }),
    );

    expect(result).toEqual({ skipped: true, reason: 'Request is not pending' });
    expect(startSlackAssistantStatusUpdatesMock).not.toHaveBeenCalled();
  });
});
