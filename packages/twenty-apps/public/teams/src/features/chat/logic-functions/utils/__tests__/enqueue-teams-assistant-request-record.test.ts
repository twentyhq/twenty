import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';
import { enqueueTeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-record';

const {
  coreApiClientMock,
  findTeamsAssistantRequestByTeamsActivityMock,
  createTeamsAssistantRequestMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  findTeamsAssistantRequestByTeamsActivityMock: vi.fn(),
  createTeamsAssistantRequestMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/features/chat/logic-functions/data/find-teams-assistant-request-by-teams-activity',
  () => ({
    findTeamsAssistantRequestByTeamsActivity:
      findTeamsAssistantRequestByTeamsActivityMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/data/create-teams-assistant-request',
  () => ({ createTeamsAssistantRequest: createTeamsAssistantRequestMock }),
);

const REQUEST_DRAFT = {
  teamsActivityId: '1700000000000',
  teamsConversationId: 'a:personal-conversation',
  teamsConversationType: 'personal',
  teamsServiceUrl: 'https://smba.trafficmanager.net/amer/',
  teamsTenantId: 'tenant-id',
  teamsUserId: '29:user-id',
  teamsUserAadObjectId: 'aad-user-id',
  requestText: 'how many open deals does Acme have?',
};

describe('enqueueTeamsAssistantRequestRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coreApiClientMock.mockImplementation(function () {
      return {};
    });
  });

  it('should record a new request as pending and hand it back', async () => {
    findTeamsAssistantRequestByTeamsActivityMock.mockResolvedValue(undefined);
    createTeamsAssistantRequestMock.mockResolvedValue('request-1');

    const result = await enqueueTeamsAssistantRequestRecord(REQUEST_DRAFT);

    expect(findTeamsAssistantRequestByTeamsActivityMock).toHaveBeenCalledWith({
      client: expect.anything(),
      teamsConversationId: 'a:personal-conversation',
      teamsActivityId: '1700000000000',
    });
    expect(result).toEqual({
      ok: true,
      request: {
        id: 'request-1',
        status: TEAMS_ASSISTANT_REQUEST_STATUS.PENDING,
        ...REQUEST_DRAFT,
      },
    });
  });

  it('should hand back an unanswered request so a retry can resume it', async () => {
    const pendingRequest = {
      id: 'request-1',
      status: TEAMS_ASSISTANT_REQUEST_STATUS.PENDING,
      ...REQUEST_DRAFT,
    };

    findTeamsAssistantRequestByTeamsActivityMock.mockResolvedValue(
      pendingRequest,
    );

    const result = await enqueueTeamsAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({ ok: true, request: pendingRequest });
    expect(createTeamsAssistantRequestMock).not.toHaveBeenCalled();
  });

  it('should skip a request another execution is already answering', async () => {
    findTeamsAssistantRequestByTeamsActivityMock.mockResolvedValue({
      id: 'request-1',
      status: TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING,
      updatedAt: new Date().toISOString(),
      ...REQUEST_DRAFT,
    });

    const result = await enqueueTeamsAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({
      ok: true,
      skipped: 'Teams activity is already queued',
    });
  });

  it('should skip a request that was already answered', async () => {
    findTeamsAssistantRequestByTeamsActivityMock.mockResolvedValue({
      id: 'request-1',
      status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
      ...REQUEST_DRAFT,
    });

    const result = await enqueueTeamsAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({
      ok: true,
      skipped: 'Teams activity is already queued',
    });
  });

  it('should hand back a request whose execution died mid-answer', async () => {
    const staleRequest = {
      id: 'request-1',
      status: TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING,
      updatedAt: new Date(
        Date.now() - (TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 1) * 1000,
      ).toISOString(),
      ...REQUEST_DRAFT,
    };

    findTeamsAssistantRequestByTeamsActivityMock.mockResolvedValue(
      staleRequest,
    );

    const result = await enqueueTeamsAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({ ok: true, request: staleRequest });
  });

  it('should hand back the winning record when losing the create race', async () => {
    const pendingRequest = {
      id: 'request-1',
      status: TEAMS_ASSISTANT_REQUEST_STATUS.PENDING,
      ...REQUEST_DRAFT,
    };

    findTeamsAssistantRequestByTeamsActivityMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(pendingRequest);
    createTeamsAssistantRequestMock.mockRejectedValue(
      new Error('duplicate key value violates unique constraint'),
    );

    const result = await enqueueTeamsAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({ ok: true, request: pendingRequest });
    expect(findTeamsAssistantRequestByTeamsActivityMock).toHaveBeenCalledTimes(
      2,
    );
  });

  it('should surface create failures that are not duplicates', async () => {
    findTeamsAssistantRequestByTeamsActivityMock.mockResolvedValue(undefined);
    createTeamsAssistantRequestMock.mockRejectedValue(
      new Error('connection refused'),
    );

    await expect(
      enqueueTeamsAssistantRequestRecord(REQUEST_DRAFT),
    ).rejects.toThrow('connection refused');
  });
});
