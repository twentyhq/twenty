import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { unfurlSlackRecordLinks } from 'src/logic-functions/utils/unfurl-slack-record-links';

const {
  coreApiClientMock,
  createWorkspaceMemberCoreApiClientMock,
  fetchSlackRecordEntitiesMock,
  fetchSlackUserIdentityMock,
  fetchWorkspaceBaseUrlsMock,
  getSlackClientMock,
  resolveSlackRunAsWorkspaceMemberIdMock,
  unfurlMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  createWorkspaceMemberCoreApiClientMock: vi.fn(),
  fetchSlackRecordEntitiesMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  resolveSlackRunAsWorkspaceMemberIdMock: vi.fn(),
  unfurlMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/logic-functions/utils/create-workspace-member-core-api-client',
  () => ({
    createWorkspaceMemberCoreApiClient: createWorkspaceMemberCoreApiClientMock,
  }),
);

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

vi.mock(
  'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id',
  () => ({
    resolveSlackRunAsWorkspaceMemberId: resolveSlackRunAsWorkspaceMemberIdMock,
  }),
);

const WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const RECORD_URL =
  'https://acme.twenty.com/object/person/20202020-1111-4111-8111-111111111111';

const applicationClient = { role: 'application' };
const posterClient = { role: 'poster' };

const BODY: SlackEventsRequestBody = {
  type: 'event_callback',
  event: {
    type: 'link_shared',
    user: 'U123',
    channel: 'C123',
    message_ts: '1700000000.000100',
    links: [{ url: RECORD_URL, domain: 'acme.twenty.com' }],
  },
} as SlackEventsRequestBody;

describe('unfurlSlackRecordLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coreApiClientMock.mockImplementation(function () {
      return applicationClient;
    });
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://acme.twenty.com']);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { chat: { unfurl: unfurlMock } },
    });
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: 'U123',
      slackTeamId: 'T123',
      isRegularUserAccount: true,
    });
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue(
      WORKSPACE_MEMBER_ID,
    );
    createWorkspaceMemberCoreApiClientMock.mockResolvedValue(posterClient);
    fetchSlackRecordEntitiesMock.mockResolvedValue([{ entity_type: 'x' }]);
    unfurlMock.mockResolvedValue({ ok: true });
  });

  it('should read the records as the poster, never with the application role', async () => {
    const result = await unfurlSlackRecordLinks(BODY);

    expect(result).toEqual({ ok: true, unfurledCount: 1 });
    expect(createWorkspaceMemberCoreApiClientMock).toHaveBeenCalledWith({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });
    expect(fetchSlackRecordEntitiesMock).toHaveBeenCalledWith(
      expect.objectContaining({ client: posterClient }),
    );
    expect(fetchSlackRecordEntitiesMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ client: applicationClient }),
    );
    expect(unfurlMock).toHaveBeenCalledWith({
      channel: 'C123',
      ts: '1700000000.000100',
      metadata: { entities: [{ entity_type: 'x' }] },
    });
  });

  it('should skip the preview when the poster is not a workspace member', async () => {
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue(undefined);

    const result = await unfurlSlackRecordLinks(BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Poster does not map to a workspace member',
    });
    expect(createWorkspaceMemberCoreApiClientMock).not.toHaveBeenCalled();
    expect(fetchSlackRecordEntitiesMock).not.toHaveBeenCalled();
  });

  it('should skip the preview instead of falling back to the application role', async () => {
    createWorkspaceMemberCoreApiClientMock.mockResolvedValue(undefined);

    const result = await unfurlSlackRecordLinks(BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Could not act as the poster',
    });
    expect(fetchSlackRecordEntitiesMock).not.toHaveBeenCalled();
    expect(unfurlMock).not.toHaveBeenCalled();
  });

  it('should skip the preview when the poster may read none of the records', async () => {
    fetchSlackRecordEntitiesMock.mockResolvedValue([]);

    const result = await unfurlSlackRecordLinks(BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'No readable records to unfurl',
    });
    expect(unfurlMock).not.toHaveBeenCalled();
  });
});
