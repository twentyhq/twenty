import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildSlackRecordEntitiesForMessage } from 'src/logic-functions/utils/build-slack-record-entities-for-message';

const {
  coreApiClientMock,
  createWorkspaceMemberCoreApiClientMock,
  fetchSlackRecordEntitiesMock,
  fetchWorkspaceBaseUrlsMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  createWorkspaceMemberCoreApiClientMock: vi.fn(),
  fetchSlackRecordEntitiesMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
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

vi.mock('src/logic-functions/utils/fetch-workspace-base-urls', () => ({
  fetchWorkspaceBaseUrls: fetchWorkspaceBaseUrlsMock,
}));

const WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const MESSAGE_TEXT =
  'See https://acme.twenty.com/object/person/20202020-1111-4111-8111-111111111111';

const runClient = { role: 'run' };
const memberClient = { role: 'member' };

describe('buildSlackRecordEntitiesForMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    coreApiClientMock.mockImplementation(function () {
      return runClient;
    });
    createWorkspaceMemberCoreApiClientMock.mockResolvedValue(memberClient);
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://acme.twenty.com']);
    fetchSlackRecordEntitiesMock.mockResolvedValue([{ entity_type: 'x' }]);
  });

  it("should fetch previews with the run's own access when no scope is given", async () => {
    const entities = await buildSlackRecordEntitiesForMessage(MESSAGE_TEXT);

    expect(entities).toEqual([{ entity_type: 'x' }]);
    expect(fetchSlackRecordEntitiesMock).toHaveBeenCalledWith(
      expect.objectContaining({ client: runClient }),
    );
    expect(createWorkspaceMemberCoreApiClientMock).not.toHaveBeenCalled();
  });

  it('should fetch previews as the scoped workspace member', async () => {
    const entities = await buildSlackRecordEntitiesForMessage(MESSAGE_TEXT, {
      kind: 'workspaceMember',
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });

    expect(entities).toEqual([{ entity_type: 'x' }]);
    expect(createWorkspaceMemberCoreApiClientMock).toHaveBeenCalledWith({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });
    expect(fetchSlackRecordEntitiesMock).toHaveBeenCalledWith(
      expect.objectContaining({ client: memberClient }),
    );
    expect(coreApiClientMock).not.toHaveBeenCalled();
  });

  it('should drop the previews instead of falling back when the member cannot be acted as', async () => {
    createWorkspaceMemberCoreApiClientMock.mockResolvedValue(undefined);

    const entities = await buildSlackRecordEntitiesForMessage(MESSAGE_TEXT, {
      kind: 'workspaceMember',
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });

    expect(entities).toEqual([]);
    expect(fetchSlackRecordEntitiesMock).not.toHaveBeenCalled();
  });

  it('should attach no previews when the scope is nobody', async () => {
    const entities = await buildSlackRecordEntitiesForMessage(MESSAGE_TEXT, {
      kind: 'none',
    });

    expect(entities).toEqual([]);
    expect(fetchSlackRecordEntitiesMock).not.toHaveBeenCalled();
    expect(coreApiClientMock).not.toHaveBeenCalled();
  });

  it('should not query anything for a message without record links', async () => {
    const entities = await buildSlackRecordEntitiesForMessage('hello', {
      kind: 'workspaceMember',
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });

    expect(entities).toEqual([]);
    expect(fetchWorkspaceBaseUrlsMock).not.toHaveBeenCalled();
  });
});
