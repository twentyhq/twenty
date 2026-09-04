import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { presentSlackRecordDetails } from 'src/logic-functions/utils/present-slack-record-details';

const {
  parseSlackEntityDetailsEventMock,
  fetchWorkspaceBaseUrlsMock,
  parseTwentyRecordLinksMock,
  getSlackClientMock,
  fetchSlackUserIdentityMock,
  resolveSlackRunAsWorkspaceMemberIdMock,
  createWorkspaceMemberCoreClientMock,
  findSlackUnfurlRecordMock,
  buildSlackRecordUnfurlEntityMock,
  presentDetailsMock,
} = vi.hoisted(() => ({
  parseSlackEntityDetailsEventMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
  parseTwentyRecordLinksMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
  resolveSlackRunAsWorkspaceMemberIdMock: vi.fn(),
  createWorkspaceMemberCoreClientMock: vi.fn(),
  findSlackUnfurlRecordMock: vi.fn(),
  buildSlackRecordUnfurlEntityMock: vi.fn(),
  presentDetailsMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/utils/parse-slack-entity-details-event', () => ({
  parseSlackEntityDetailsEvent: parseSlackEntityDetailsEventMock,
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

vi.mock('src/logic-functions/data/find-slack-unfurl-record', () => ({
  findSlackUnfurlRecord: findSlackUnfurlRecordMock,
}));

vi.mock('src/logic-functions/utils/build-slack-record-unfurl-entity', () => ({
  buildSlackRecordUnfurlEntity: buildSlackRecordUnfurlEntityMock,
}));

const WORKSPACE_MEMBER_ID = '20202020-0000-0000-0000-000000000001';
const RECORD_LINK = {
  sharedUrl: 'https://app.twenty.test/object/person/1',
  canonicalUrl: 'https://app.twenty.test/object/person/1',
  objectNameSingular: 'person',
  recordId: '20202020-0000-0000-0000-000000000002',
};

const BODY = {} as SlackEventsRequestBody;

describe('presentSlackRecordDetails', () => {
  beforeEach(() => {
    parseSlackEntityDetailsEventMock.mockReturnValue({
      detailsRequest: {
        triggerId: 'trigger-1',
        slackUserId: 'U1',
        entityUrl: RECORD_LINK.sharedUrl,
        externalRef: undefined,
      },
    });
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://app.twenty.test']);
    parseTwentyRecordLinksMock.mockReturnValue([RECORD_LINK]);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { entity: { presentDetails: presentDetailsMock } },
    });
    fetchSlackUserIdentityMock.mockResolvedValue({ slackUserId: 'U1' });
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue(
      WORKSPACE_MEMBER_ID,
    );
    findSlackUnfurlRecordMock.mockResolvedValue({ id: RECORD_LINK.recordId });
    buildSlackRecordUnfurlEntityMock.mockReturnValue({
      entity_type: 'person',
    });
    presentDetailsMock.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should read the record as the viewer', async () => {
    const viewerClient = { id: 'viewer-client' };

    createWorkspaceMemberCoreClientMock.mockResolvedValue(viewerClient);

    const result = await presentSlackRecordDetails(BODY);

    expect(createWorkspaceMemberCoreClientMock).toHaveBeenCalledWith(
      WORKSPACE_MEMBER_ID,
    );
    expect(findSlackUnfurlRecordMock).toHaveBeenCalledWith(
      expect.objectContaining({ client: viewerClient }),
    );
    expect(result).toEqual({ ok: true, presented: true });
  });

  it('should not present details when the viewer read access cannot be established', async () => {
    createWorkspaceMemberCoreClientMock.mockResolvedValue(undefined);

    const result = await presentSlackRecordDetails(BODY);

    expect(findSlackUnfurlRecordMock).not.toHaveBeenCalled();
    expect(presentDetailsMock).toHaveBeenCalledWith({
      trigger_id: 'trigger-1',
      error: {
        status: 'custom',
        custom_message: 'Twenty could not confirm your access to this record.',
      },
    });
    expect(result).toEqual({
      ok: true,
      skipped: 'Viewer read access could not be established',
    });
  });
});
