import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { unfurlSlackRecordLinks } from 'src/logic-functions/utils/unfurl-slack-record-links';

const {
  coreApiClientMock,
  fetchSlackRecordEntitiesMock,
  fetchSlackUserIdentityMock,
  fetchWorkspaceBaseUrlsMock,
  getSlackClientMock,
  isSlackChannelSilencedMock,
  resolveSlackRunAsWorkspaceMemberIdMock,
  unfurlMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  fetchSlackRecordEntitiesMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  isSlackChannelSilencedMock: vi.fn(),
  resolveSlackRunAsWorkspaceMemberIdMock: vi.fn(),
  unfurlMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-record-entities', () => ({
  fetchSlackRecordEntities: fetchSlackRecordEntitiesMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-user-identity', () => ({
  fetchSlackUserIdentity: fetchSlackUserIdentityMock,
}));

vi.mock('src/logic-functions/utils/fetch-workspace-base-urls', () => ({
  fetchWorkspaceBaseUrls: fetchWorkspaceBaseUrlsMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/is-slack-channel-silenced', () => ({
  isSlackChannelSilenced: isSlackChannelSilencedMock,
}));

vi.mock(
  'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id',
  () => ({
    resolveSlackRunAsWorkspaceMemberId: resolveSlackRunAsWorkspaceMemberIdMock,
  }),
);

const CHANNEL_ID = 'C123';
const RECORD_URL =
  'https://app.twenty.com/object/person/20202020-ac73-4797-824e-87a1f5aea9e0';

const buildPostedLinkEvent = (): SlackEventsRequestBody => ({
  type: 'event_callback',
  team_id: 'T123',
  event: {
    type: 'link_shared',
    channel: CHANNEL_ID,
    message_ts: '1.1',
    user: 'UHUMAN',
    links: [{ url: RECORD_URL }],
  },
});

const buildComposerLinkEvent = (): SlackEventsRequestBody => ({
  type: 'event_callback',
  team_id: 'T123',
  event: {
    type: 'link_shared',
    source: 'composer',
    unfurl_id: 'unfurl-1',
    user: 'UHUMAN',
    links: [{ url: RECORD_URL }],
  },
});

describe('unfurlSlackRecordLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSlackChannelSilencedMock.mockResolvedValue(false);
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://app.twenty.com']);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { chat: { unfurl: unfurlMock } },
    });
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: 'UHUMAN',
      slackTeamId: 'T123',
    });
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue('member-1');
    fetchSlackRecordEntitiesMock.mockResolvedValue([{ entity_type: 'item' }]);
    unfurlMock.mockResolvedValue({ ok: true });
  });

  it('should unfurl a record link posted in a channel with no rule', async () => {
    const result = await unfurlSlackRecordLinks(buildPostedLinkEvent());

    expect(result).toEqual({ ok: true, unfurledCount: 1 });
    expect(unfurlMock).toHaveBeenCalledTimes(1);
  });

  it('should not unfurl in a channel a rule silences', async () => {
    isSlackChannelSilencedMock.mockResolvedValue(true);

    const result = await unfurlSlackRecordLinks(buildPostedLinkEvent());

    expect(result).toEqual({
      ok: true,
      skipped: 'Channel is silenced by a channel rule',
    });
    expect(unfurlMock).not.toHaveBeenCalled();
  });

  it('should not read records for a silenced channel', async () => {
    isSlackChannelSilencedMock.mockResolvedValue(true);

    await unfurlSlackRecordLinks(buildPostedLinkEvent());

    expect(fetchSlackRecordEntitiesMock).not.toHaveBeenCalled();
    expect(fetchWorkspaceBaseUrlsMock).not.toHaveBeenCalled();
  });

  it('should check the rule against the channel the link was posted in', async () => {
    await unfurlSlackRecordLinks(buildPostedLinkEvent());

    expect(isSlackChannelSilencedMock).toHaveBeenCalledWith(
      expect.objectContaining({ slackChannelId: CHANNEL_ID }),
    );
  });

  it('should skip the rule lookup for a composer preview, which carries no channel', async () => {
    const result = await unfurlSlackRecordLinks(buildComposerLinkEvent());

    expect(result).toEqual({ ok: true, unfurledCount: 1 });
    expect(isSlackChannelSilencedMock).not.toHaveBeenCalled();
  });
});
