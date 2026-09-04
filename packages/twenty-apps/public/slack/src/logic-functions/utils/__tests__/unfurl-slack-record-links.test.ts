import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { unfurlSlackRecordLinks } from 'src/logic-functions/utils/unfurl-slack-record-links';

const {
  parseSlackLinkSharedEventMock,
  fetchWorkspaceBaseUrlsMock,
  parseTwentyRecordLinksMock,
  getSlackClientMock,
  fetchSlackUserIdentityMock,
  resolveSlackRunAsWorkspaceMemberIdMock,
  createWorkspaceMemberCoreClientMock,
  fetchSlackRecordEntitiesMock,
  unfurlMock,
} = vi.hoisted(() => ({
  parseSlackLinkSharedEventMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
  parseTwentyRecordLinksMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
  resolveSlackRunAsWorkspaceMemberIdMock: vi.fn(),
  createWorkspaceMemberCoreClientMock: vi.fn(),
  fetchSlackRecordEntitiesMock: vi.fn(),
  unfurlMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/utils/parse-slack-link-shared-event', () => ({
  parseSlackLinkSharedEvent: parseSlackLinkSharedEventMock,
}));

vi.mock('src/logic-functions/utils/fetch-workspace-base-urls', () => ({
  fetchWorkspaceBaseUrls: fetchWorkspaceBaseUrlsMock,
}));

vi.mock('src/logic-functions/utils/parse-twenty-record-links', () => ({
  parseTwentyRecordLinks: parseTwentyRecordLinksMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-user-identity', () => ({
  fetchSlackUserIdentity: fetchSlackUserIdentityMock,
}));

vi.mock(
  'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id',
  () => ({
    resolveSlackRunAsWorkspaceMemberId:
      resolveSlackRunAsWorkspaceMemberIdMock,
  }),
);

vi.mock('src/logic-functions/utils/create-workspace-member-core-client', () => ({
  createWorkspaceMemberCoreClient: createWorkspaceMemberCoreClientMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-record-entities', () => ({
  fetchSlackRecordEntities: fetchSlackRecordEntitiesMock,
}));

const WORKSPACE_MEMBER_ID = '20202020-0000-0000-0000-000000000001';
const RECORD_LINK = {
  sharedUrl: 'https://app.twenty.test/object/person/1',
  canonicalUrl: 'https://app.twenty.test/object/person/1',
  objectNameSingular: 'person',
  recordId: '20202020-0000-0000-0000-000000000002',
};

const BODY = {} as SlackEventsRequestBody;

describe('unfurlSlackRecordLinks', () => {
  beforeEach(() => {
    parseSlackLinkSharedEventMock.mockReturnValue({
      linkShared: {
        unfurlTarget: {
          source: 'conversations_history',
          slackChannelId: 'C1',
          messageTimestamp: '1700000000.000100',
        },
        slackUserId: 'U1',
        urls: [RECORD_LINK.sharedUrl],
      },
    });
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://app.twenty.test']);
    parseTwentyRecordLinksMock.mockReturnValue([RECORD_LINK]);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { chat: { unfurl: unfurlMock } },
    });
    fetchSlackUserIdentityMock.mockResolvedValue({ slackUserId: 'U1' });
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue(
      WORKSPACE_MEMBER_ID,
    );
    fetchSlackRecordEntitiesMock.mockResolvedValue([{ entity_type: 'person' }]);
    unfurlMock.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should read the records as the poster', async () => {
    const posterClient = { id: 'poster-client' };

    createWorkspaceMemberCoreClientMock.mockResolvedValue(posterClient);

    const result = await unfurlSlackRecordLinks(BODY);

    expect(createWorkspaceMemberCoreClientMock).toHaveBeenCalledWith(
      WORKSPACE_MEMBER_ID,
    );
    expect(fetchSlackRecordEntitiesMock).toHaveBeenCalledWith(
      expect.objectContaining({ client: posterClient }),
    );
    expect(result).toEqual({ ok: true, unfurledCount: 1 });
  });

  it('should not unfurl when the poster read access cannot be established', async () => {
    createWorkspaceMemberCoreClientMock.mockResolvedValue(undefined);

    const result = await unfurlSlackRecordLinks(BODY);

    expect(fetchSlackRecordEntitiesMock).not.toHaveBeenCalled();
    expect(unfurlMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      skipped: 'Poster read access could not be established',
    });
  });
});
