import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_CHANNEL_MODE } from 'src/logic-functions/constants/slack-channel-mode';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';

const {
  createSlackAssistantRequestMock,
  findSlackAssistantRequestBySlackMessageMock,
  postSlackAccountLinkPromptMock,
  resolveSlackChannelModeMock,
  resolveSlackUserLinkMock,
} = vi.hoisted(() => ({
  createSlackAssistantRequestMock: vi.fn(),
  findSlackAssistantRequestBySlackMessageMock: vi.fn(),
  postSlackAccountLinkPromptMock: vi.fn(),
  resolveSlackChannelModeMock: vi.fn(),
  resolveSlackUserLinkMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));
vi.mock('src/logic-functions/data/create-slack-assistant-request', () => ({
  createSlackAssistantRequest: createSlackAssistantRequestMock,
}));
vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-by-slack-message',
  () => ({
    findSlackAssistantRequestBySlackMessage:
      findSlackAssistantRequestBySlackMessageMock,
  }),
);
vi.mock('src/logic-functions/utils/post-slack-account-link-prompt', () => ({
  postSlackAccountLinkPrompt: postSlackAccountLinkPromptMock,
}));
vi.mock('src/logic-functions/utils/resolve-slack-channel-mode', () => ({
  resolveSlackChannelMode: resolveSlackChannelModeMock,
}));
vi.mock('src/logic-functions/utils/resolve-slack-user-link', () => ({
  resolveSlackUserLink: resolveSlackUserLinkMock,
}));

const mentionBody = {
  type: 'event_callback',
  event_id: 'Ev1',
  event: {
    type: 'app_mention',
    channel: 'C1',
    channel_type: 'channel',
    ts: '1700000000.000100',
    user: 'U1',
    text: '<@BOT> how many open opportunities do we have?',
  },
} as SlackEventsRequestBody;

describe('enqueueSlackAssistantRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SLACK_REQUIRE_USER_MAPPING;
    resolveSlackChannelModeMock.mockResolvedValue(SLACK_CHANNEL_MODE.OPEN);
    resolveSlackUserLinkMock.mockResolvedValue({
      workspaceMemberId: 'member-1',
    });
    findSlackAssistantRequestBySlackMessageMock.mockResolvedValue(undefined);
    createSlackAssistantRequestMock.mockResolvedValue('request-1');
  });

  afterEach(() => {
    delete process.env.SLACK_REQUIRE_USER_MAPPING;
  });

  it('should enqueue a request in an open channel', async () => {
    const result = await enqueueSlackAssistantRequest(mentionBody);

    expect(result).toEqual({ ok: true });
    expect(createSlackAssistantRequestMock).toHaveBeenCalledTimes(1);
  });

  it('should not create a record in a silent channel', async () => {
    resolveSlackChannelModeMock.mockResolvedValue(SLACK_CHANNEL_MODE.SILENT);

    const result = await enqueueSlackAssistantRequest(mentionBody);

    expect(result).toEqual({ ok: true, skipped: 'Channel rule is silent' });
    expect(createSlackAssistantRequestMock).not.toHaveBeenCalled();
  });

  it('should still enqueue an unlinked user when mapping is not required', async () => {
    resolveSlackUserLinkMock.mockResolvedValue(undefined);

    const result = await enqueueSlackAssistantRequest(mentionBody);

    expect(result).toEqual({ ok: true });
    expect(createSlackAssistantRequestMock).toHaveBeenCalledTimes(1);
    expect(postSlackAccountLinkPromptMock).not.toHaveBeenCalled();
  });

  it('should prompt an unlinked user to link instead of enqueueing when mapping is required', async () => {
    process.env.SLACK_REQUIRE_USER_MAPPING = 'true';
    resolveSlackUserLinkMock.mockResolvedValue(undefined);

    const result = await enqueueSlackAssistantRequest(mentionBody);

    expect(result).toEqual({
      ok: true,
      skipped: 'Slack user is not linked to a workspace member',
    });
    expect(postSlackAccountLinkPromptMock).toHaveBeenCalledWith({
      slackChannelId: 'C1',
      slackUserId: 'U1',
    });
    expect(createSlackAssistantRequestMock).not.toHaveBeenCalled();
  });

  it('should enqueue a linked user when mapping is required', async () => {
    process.env.SLACK_REQUIRE_USER_MAPPING = 'true';

    const result = await enqueueSlackAssistantRequest(mentionBody);

    expect(result).toEqual({ ok: true });
    expect(createSlackAssistantRequestMock).toHaveBeenCalledTimes(1);
  });
});
