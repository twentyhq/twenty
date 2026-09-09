import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { presentSlackRecordDetails } from 'src/logic-functions/utils/present-slack-record-details';

const {
  coreApiClientMock,
  createWorkspaceMemberCoreApiClientMock,
  fetchSlackUserIdentityMock,
  fetchWorkspaceBaseUrlsMock,
  findSlackUnfurlRecordMock,
  getSlackClientMock,
  presentDetailsMock,
  resolveSlackRunAsWorkspaceMemberIdMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  createWorkspaceMemberCoreApiClientMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
  findSlackUnfurlRecordMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  presentDetailsMock: vi.fn(),
  resolveSlackRunAsWorkspaceMemberIdMock: vi.fn(),
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

vi.mock('src/logic-functions/data/find-slack-unfurl-record', () => ({
  findSlackUnfurlRecord: findSlackUnfurlRecordMock,
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
const RECORD_ID = '20202020-1111-4111-8111-111111111111';
const RECORD_URL = `https://acme.twenty.com/object/person/${RECORD_ID}`;

const applicationClient = { role: 'application' };
const viewerClient = { role: 'viewer' };

const BODY: SlackEventsRequestBody = {
  type: 'event_callback',
  event: {
    type: 'entity_details_requested',
    trigger_id: 'Tr123',
    user: 'U123',
    entity_url: RECORD_URL,
    external_ref: { id: RECORD_ID, type: 'person' },
  },
} as SlackEventsRequestBody;

describe('presentSlackRecordDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    coreApiClientMock.mockImplementation(function () {
      return applicationClient;
    });
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://acme.twenty.com']);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { entity: { presentDetails: presentDetailsMock } },
    });
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: 'U123',
      slackTeamId: 'T123',
      isRegularUserAccount: true,
    });
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue(
      WORKSPACE_MEMBER_ID,
    );
    createWorkspaceMemberCoreApiClientMock.mockResolvedValue(viewerClient);
    findSlackUnfurlRecordMock.mockResolvedValue({
      id: RECORD_ID,
      name: { firstName: 'Ada', lastName: 'Lovelace' },
      emails: { primaryEmail: 'ada@acme.com' },
    });
    presentDetailsMock.mockResolvedValue({ ok: true });
  });

  it('should read the record as the viewer, never with the application role', async () => {
    const result = await presentSlackRecordDetails(BODY);

    expect(result).toEqual({ ok: true, presented: true });
    expect(createWorkspaceMemberCoreApiClientMock).toHaveBeenCalledWith({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });
    expect(findSlackUnfurlRecordMock).toHaveBeenCalledWith({
      client: viewerClient,
      objectNameSingular: 'person',
      recordId: RECORD_ID,
    });
    expect(presentDetailsMock).toHaveBeenCalledWith(
      expect.objectContaining({ trigger_id: 'Tr123' }),
    );
    expect(presentDetailsMock.mock.calls[0][0]).not.toHaveProperty('error');
  });

  it('should refuse the panel when the viewer is not a workspace member', async () => {
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue(undefined);

    const result = await presentSlackRecordDetails(BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Viewer does not map to a workspace member',
    });
    expect(findSlackUnfurlRecordMock).not.toHaveBeenCalled();
    expect(presentDetailsMock).toHaveBeenCalledWith({
      trigger_id: 'Tr123',
      error: {
        status: 'custom',
        custom_message:
          'Record details are only available to Twenty workspace members.',
      },
    });
  });

  it('should refuse the panel instead of falling back to the application role', async () => {
    createWorkspaceMemberCoreApiClientMock.mockResolvedValue(undefined);

    const result = await presentSlackRecordDetails(BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Could not act as the viewer',
    });
    expect(findSlackUnfurlRecordMock).not.toHaveBeenCalled();
    expect(presentDetailsMock).toHaveBeenCalledWith({
      trigger_id: 'Tr123',
      error: {
        status: 'custom',
        custom_message: 'Twenty could not check your access to this record.',
      },
    });
  });

  it('should report a record the viewer may not read as missing', async () => {
    findSlackUnfurlRecordMock.mockResolvedValue(undefined);

    const result = await presentSlackRecordDetails(BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Record is missing or unreadable',
    });
    expect(presentDetailsMock).toHaveBeenCalledWith({
      trigger_id: 'Tr123',
      error: {
        status: 'custom',
        custom_message: 'This record could not be found in Twenty.',
      },
    });
  });
});
