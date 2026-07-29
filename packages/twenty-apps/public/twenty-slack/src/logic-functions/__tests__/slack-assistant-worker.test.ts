import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_CHANNEL_MODE } from 'src/logic-functions/constants/slack-channel-mode';
import { slackAssistantWorkerHandler } from 'src/logic-functions/slack-assistant-worker';

const {
  fetchSlackAssistantContextMock,
  resolveSlackChannelModeMock,
  resolveSlackUserLinkMock,
  runAgentMock,
  runSlackReactionMock,
  slackPostMessageHandlerMock,
  slackUpdateMessageHandlerMock,
  subscribeSlackThreadMock,
  updateSlackAssistantRequestMock,
} = vi.hoisted(() => ({
  fetchSlackAssistantContextMock: vi.fn(),
  resolveSlackChannelModeMock: vi.fn(),
  resolveSlackUserLinkMock: vi.fn(),
  runAgentMock: vi.fn(),
  runSlackReactionMock: vi.fn(),
  slackPostMessageHandlerMock: vi.fn(),
  slackUpdateMessageHandlerMock: vi.fn(),
  subscribeSlackThreadMock: vi.fn(),
  updateSlackAssistantRequestMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));
vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));
vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));
vi.mock('src/logic-functions/data/update-slack-assistant-request', () => ({
  updateSlackAssistantRequest: updateSlackAssistantRequestMock,
}));
vi.mock('src/logic-functions/handlers/slack-post-message-handler', () => ({
  slackPostMessageHandler: slackPostMessageHandlerMock,
}));
vi.mock('src/logic-functions/handlers/slack-update-message-handler', () => ({
  slackUpdateMessageHandler: slackUpdateMessageHandlerMock,
}));
vi.mock('src/logic-functions/utils/fetch-slack-assistant-context', () => ({
  fetchSlackAssistantContext: fetchSlackAssistantContextMock,
}));
vi.mock('src/logic-functions/utils/resolve-slack-channel-mode', () => ({
  resolveSlackChannelMode: resolveSlackChannelModeMock,
}));
vi.mock('src/logic-functions/utils/resolve-slack-user-link', () => ({
  resolveSlackUserLink: resolveSlackUserLinkMock,
}));
vi.mock('src/logic-functions/utils/run-slack-reaction', () => ({
  runSlackReaction: runSlackReactionMock,
}));
vi.mock('src/logic-functions/utils/subscribe-slack-thread', () => ({
  subscribeSlackThread: subscribeSlackThreadMock,
}));

const buildEvent = () =>
  ({
    properties: {
      after: {
        id: 'request-1',
        status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
        slackChannelId: 'C1',
        slackChannelType: 'channel',
        slackThreadTimestamp: '',
        slackMessageTimestamp: '1700000000.000100',
        slackUserId: 'U1',
        requestText: 'how many open opportunities do we have?',
      },
    },
  }) as Parameters<typeof slackAssistantWorkerHandler>[0];

describe('slackAssistantWorkerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SLACK_REQUIRE_USER_MAPPING;
    resolveSlackChannelModeMock.mockResolvedValue(SLACK_CHANNEL_MODE.OPEN);
    resolveSlackUserLinkMock.mockResolvedValue({
      workspaceMemberId: 'member-1',
    });
    updateSlackAssistantRequestMock.mockResolvedValue(undefined);
    runSlackReactionMock.mockResolvedValue(undefined);
    subscribeSlackThreadMock.mockResolvedValue(undefined);
    slackPostMessageHandlerMock.mockResolvedValue({
      success: true,
      slackTs: '1700000000.000200',
    });
    slackUpdateMessageHandlerMock.mockResolvedValue({ success: true });
    fetchSlackAssistantContextMock.mockResolvedValue({
      conversationContext: undefined,
      requesterName: 'Ada',
    });
    runAgentMock.mockResolvedValue({
      success: true,
      result: { response: '12 open opportunities.' },
      error: null,
    });
  });

  afterEach(() => {
    delete process.env.SLACK_REQUIRE_USER_MAPPING;
  });

  it('should run as the linked workspace member', async () => {
    await slackAssistantWorkerHandler(buildEvent());

    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
        runAsWorkspaceMemberId: 'member-1',
      }),
    );
  });

  it('should omit the member for an unlinked Slack user', async () => {
    resolveSlackUserLinkMock.mockResolvedValue(undefined);

    await slackAssistantWorkerHandler(buildEvent());

    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAsWorkspaceMemberId: undefined }),
    );
  });

  it('should use the read-only agent in a read-only channel', async () => {
    resolveSlackChannelModeMock.mockResolvedValue(SLACK_CHANNEL_MODE.READ_ONLY);

    await slackAssistantWorkerHandler(buildEvent());

    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        agentUniversalIdentifier:
          SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
        runAsWorkspaceMemberId: 'member-1',
      }),
    );
  });

  it('should post nothing in a silent channel', async () => {
    resolveSlackChannelModeMock.mockResolvedValue(SLACK_CHANNEL_MODE.SILENT);

    const result = await slackAssistantWorkerHandler(buildEvent());

    expect(result).toEqual({
      skipped: true,
      reason: 'Channel rule is silent',
    });
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(slackPostMessageHandlerMock).not.toHaveBeenCalled();
    expect(updateSlackAssistantRequestMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: SLACK_ASSISTANT_REQUEST_STATUS.SKIPPED,
      }),
    );
  });

  it('should not answer an unlinked user when mapping is required', async () => {
    process.env.SLACK_REQUIRE_USER_MAPPING = 'true';
    resolveSlackUserLinkMock.mockResolvedValue(undefined);

    const result = await slackAssistantWorkerHandler(buildEvent());

    expect(result).toEqual({
      skipped: true,
      reason: 'Slack user is not linked to a workspace member',
    });
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(slackPostMessageHandlerMock).not.toHaveBeenCalled();
  });
});
