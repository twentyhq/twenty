import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { TEAMS_ASSISTANT_UNMATCHED_SENDER_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-unmatched-sender-text';
import { answerTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/answer-teams-assistant-request';

const {
  claimMock,
  updateMock,
  resolveSenderMock,
  runAgentMock,
  sendActivityMock,
  findHistoryMock,
} = vi.hoisted(() => ({
  claimMock: vi.fn(),
  updateMock: vi.fn(),
  resolveSenderMock: vi.fn(),
  runAgentMock: vi.fn(),
  sendActivityMock: vi.fn(),
  findHistoryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return {};
  }),
}));

vi.mock(
  'src/features/chat/logic-functions/data/claim-teams-assistant-request',
  () => ({ claimTeamsAssistantRequest: claimMock }),
);

vi.mock(
  'src/features/chat/logic-functions/data/find-teams-assistant-history',
  () => ({ findTeamsAssistantHistory: findHistoryMock }),
);

vi.mock(
  'src/features/chat/logic-functions/data/update-teams-assistant-request',
  () => ({ updateTeamsAssistantRequest: updateMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw',
  () => ({
    getTeamsConnectorAccessTokenOrThrow: vi.fn().mockResolvedValue('token'),
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/resolve-teams-sender-workspace-member-id',
  () => ({ resolveTeamsSenderWorkspaceMemberId: resolveSenderMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/run-teams-assistant-agent-or-throw',
  () => ({ runTeamsAssistantAgentOrThrow: runAgentMock }),
);

vi.mock('src/features/chat/logic-functions/utils/send-teams-activity', () => ({
  sendTeamsActivity: sendActivityMock,
}));

const REQUEST = {
  id: 'request-1',
  teamsActivityId: '1700000000000',
  teamsConversationId: 'a:personal-conversation',
  teamsConversationType: 'personal',
  teamsServiceUrl: 'https://smba.trafficmanager.net/amer/',
  teamsTenantId: 'tenant-id',
  teamsUserId: '29:user-id',
  teamsUserAadObjectId: 'aad-user-id',
  requestText: 'how many open deals does Acme have?',
};

const answer = () =>
  answerTeamsAssistantRequest({
    request: REQUEST,
    agentDeadlineAtMs: Date.now() + 60_000,
  });

const sentMessageTexts = () =>
  sendActivityMock.mock.calls
    .map(([{ activity }]) => activity)
    .filter((activity) => activity.type === 'message')
    .map((activity) => activity.text);

describe('answerTeamsAssistantRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    claimMock.mockResolvedValue(true);
    updateMock.mockResolvedValue(undefined);
    sendActivityMock.mockResolvedValue({ id: 'activity-1' });
    resolveSenderMock.mockResolvedValue('workspace-member-1');
    runAgentMock.mockResolvedValue('Acme has 3 open deals.');
    findHistoryMock.mockResolvedValue([]);
  });

  it('should answer as the matched workspace member and mark the request done', async () => {
    await expect(answer()).resolves.toEqual({ status: 'answered' });

    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requestText: REQUEST.requestText,
        workspaceMemberId: 'workspace-member-1',
      }),
    );
    expect(sentMessageTexts()).toEqual(['Acme has 3 open deals.']);
    expect(updateMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: REQUEST.id,
        status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: 'Acme has 3 open deals.',
      }),
    );
  });

  it('should pass the earlier turns of the sender in this conversation to the agent', async () => {
    const history = [{ requestText: 'hi', responseText: 'Hi!' }];
    findHistoryMock.mockResolvedValue(history);

    await answer();

    expect(findHistoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        teamsConversationId: REQUEST.teamsConversationId,
        workspaceMemberId: 'workspace-member-1',
      }),
    );
    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({ history }),
    );
  });

  it('should still answer without history when it cannot be loaded', async () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    findHistoryMock.mockRejectedValue(new Error('Core API unavailable'));

    await expect(answer()).resolves.toEqual({ status: 'answered' });
    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({ history: [] }),
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('should not send a failure reply when only the status write fails after answering', async () => {
    updateMock.mockImplementation(async ({ status }) => {
      if (status === TEAMS_ASSISTANT_REQUEST_STATUS.DONE) {
        throw new Error('Core API unavailable');
      }
    });

    await expect(answer()).resolves.toEqual({ status: 'answered' });
    expect(sentMessageTexts()).toEqual(['Acme has 3 open deals.']);
  });

  it('should not answer a request another execution already claimed', async () => {
    claimMock.mockResolvedValue(false);

    await expect(answer()).resolves.toMatchObject({ status: 'skipped' });
    expect(sendActivityMock).not.toHaveBeenCalled();
  });

  it('should decline a sender that matches no workspace member without running the agent', async () => {
    resolveSenderMock.mockResolvedValue(undefined);

    await expect(answer()).resolves.toMatchObject({ status: 'declined' });
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(sentMessageTexts()).toEqual([TEAMS_ASSISTANT_UNMATCHED_SENDER_TEXT]);
  });

  it('should reply with a generic message and record the error when the agent fails', async () => {
    runAgentMock.mockRejectedValue(new Error('Agent run failed'));

    await expect(answer()).resolves.toEqual({
      status: 'failed',
      reason: 'Agent run failed',
    });
    expect(sentMessageTexts()).toEqual([TEAMS_ASSISTANT_FAILURE_TEXT]);
    expect(updateMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
        errorMessage: 'Agent run failed',
      }),
    );
  });
});
