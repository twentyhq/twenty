import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ACCESS_DENIED_TEXT } from 'src/logic-functions/constants/slack-access-denied-text';
import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { SLACK_CHANNEL_ACCESS_DENIED_TEXT } from 'src/logic-functions/constants/slack-channel-access-denied-text';
import { SLACK_CHANNEL_RULE_UNREADABLE_ERROR } from 'src/logic-functions/constants/slack-channel-rule-unreadable-error';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { slackAssistantWorkerHandler } from 'src/logic-functions/handlers/slack-assistant-worker-handler';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';

const {
  callLog,
  coreApiClientMock,
  claimSlackAssistantRequestMock,
  updateSlackAssistantRequestMock,
  fetchSlackAssistantContextMock,
  fetchWorkspaceBaseUrlsMock,
  resolveSlackRunAsForRequestMock,
  runSlackAssistantAgentWithDeadlineMock,
  sendSlackMessageMock,
  startSlackAssistantStatusUpdatesMock,
  stopStatusUpdatesMock,
  finishSlackAssistantRequestWithFailureMock,
  setSlackAssistantThreadTitleMock,
  subscribeSlackThreadMock,
  resolveSlackChannelAccessPolicyMock,
  resolveSlackAccessDecisionMock,
  notifySilencedSlackChannelMock,
} = vi.hoisted(() => ({
  callLog: [] as string[],
  coreApiClientMock: vi.fn(),
  claimSlackAssistantRequestMock: vi.fn(),
  updateSlackAssistantRequestMock: vi.fn(),
  fetchSlackAssistantContextMock: vi.fn(),
  fetchWorkspaceBaseUrlsMock: vi.fn(),
  resolveSlackRunAsForRequestMock: vi.fn(),
  runSlackAssistantAgentWithDeadlineMock: vi.fn(),
  sendSlackMessageMock: vi.fn(),
  startSlackAssistantStatusUpdatesMock: vi.fn(),
  stopStatusUpdatesMock: vi.fn(),
  finishSlackAssistantRequestWithFailureMock: vi.fn(),
  setSlackAssistantThreadTitleMock: vi.fn(),
  subscribeSlackThreadMock: vi.fn(),
  resolveSlackChannelAccessPolicyMock: vi.fn(),
  resolveSlackAccessDecisionMock: vi.fn(),
  notifySilencedSlackChannelMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/resolve-slack-access-decision', () => ({
  resolveSlackAccessDecision: resolveSlackAccessDecisionMock,
}));

vi.mock('src/logic-functions/utils/notify-silenced-slack-channel', () => ({
  notifySilencedSlackChannel: notifySilencedSlackChannelMock,
}));

vi.mock(
  'src/logic-functions/utils/resolve-slack-channel-access-policy',
  () => ({
    resolveSlackChannelAccessPolicy: resolveSlackChannelAccessPolicyMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/claim-slack-assistant-request', () => ({
  claimSlackAssistantRequest: claimSlackAssistantRequestMock,
}));

vi.mock('src/logic-functions/data/update-slack-assistant-request', () => ({
  updateSlackAssistantRequest: updateSlackAssistantRequestMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-assistant-context', () => ({
  fetchSlackAssistantContext: fetchSlackAssistantContextMock,
}));

vi.mock('src/logic-functions/utils/fetch-workspace-base-urls', () => ({
  fetchWorkspaceBaseUrls: fetchWorkspaceBaseUrlsMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-run-as-for-request', () => ({
  resolveSlackRunAsForRequest: resolveSlackRunAsForRequestMock,
}));

vi.mock(
  'src/logic-functions/utils/run-slack-assistant-agent-with-deadline',
  () => ({
    runSlackAssistantAgentWithDeadline: runSlackAssistantAgentWithDeadlineMock,
  }),
);

vi.mock('src/logic-functions/utils/send-slack-message', () => ({
  sendSlackMessage: sendSlackMessageMock,
}));

vi.mock(
  'src/logic-functions/utils/start-slack-assistant-status-updates',
  () => ({
    startSlackAssistantStatusUpdates: startSlackAssistantStatusUpdatesMock,
  }),
);

vi.mock(
  'src/logic-functions/utils/finish-slack-assistant-request-with-failure',
  () => ({
    finishSlackAssistantRequestWithFailure:
      finishSlackAssistantRequestWithFailureMock,
  }),
);

vi.mock('src/logic-functions/utils/set-slack-assistant-thread-title', () => ({
  setSlackAssistantThreadTitle: setSlackAssistantThreadTitleMock,
}));

vi.mock('src/logic-functions/utils/subscribe-slack-thread', () => ({
  subscribeSlackThread: subscribeSlackThreadMock,
}));

const REQUEST_RECORD: SlackAssistantRequestRecord = {
  id: 'request-1',
  status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
  slackChannelId: 'D123',
  slackChannelType: 'im',
  slackThreadTimestamp: '',
  slackMessageTimestamp: '1700000000.000100',
  slackUserId: 'U123',
  requestText: 'how many open deals does Acme have?',
};

const REQUESTER_IDENTITY = {
  slackUserId: 'U123',
  slackTeamId: 'T0INSTALLED',
  displayName: 'Ada',
  email: 'ada@example.com',
  isRegularUserAccount: true,
};

const SLACK_CONTEXT = {
  conversationMessages: [],
  sharedFiles: [],
  requesterName: 'Ada',
  requesterIdentity: undefined,
  requestMessage: undefined,
  threadMessages: [],
  slackClient: undefined,
  assistantBotUserId: undefined,
  isDirectMessage: true,
};

describe('slackAssistantWorkerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callLog.length = 0;

    coreApiClientMock.mockImplementation(function () {
      return {};
    });
    claimSlackAssistantRequestMock.mockResolvedValue(true);
    notifySilencedSlackChannelMock.mockResolvedValue(undefined);
    updateSlackAssistantRequestMock.mockResolvedValue(undefined);
    fetchWorkspaceBaseUrlsMock.mockResolvedValue(['https://acme.twenty.com']);
    resolveSlackRunAsForRequestMock.mockResolvedValue(undefined);
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({
      status: 'ANSWER',
      accessMode: SLACK_ACCESS_MODE.ANYONE,
      capability: 'FULL',
      isChannelRule: false,
    });
    resolveSlackAccessDecisionMock.mockResolvedValue({ status: 'ALLOWED' });
    setSlackAssistantThreadTitleMock.mockResolvedValue(undefined);
    subscribeSlackThreadMock.mockResolvedValue(undefined);

    startSlackAssistantStatusUpdatesMock.mockImplementation(() => {
      callLog.push('status:start');

      return stopStatusUpdatesMock;
    });
    stopStatusUpdatesMock.mockImplementation(async () => {
      callLog.push('status:stop');
    });
    fetchSlackAssistantContextMock.mockImplementation(async () => {
      callLog.push('context:fetch');

      return SLACK_CONTEXT;
    });
    runSlackAssistantAgentWithDeadlineMock.mockImplementation(async () => {
      callLog.push('agent:run');

      return { success: true, error: null, result: { response: 'Two.' } };
    });
    sendSlackMessageMock.mockImplementation(async () => {
      callLog.push('reply:answer');

      return { success: true, slackTs: '1700000000.000200' };
    });
    finishSlackAssistantRequestWithFailureMock.mockImplementation(
      async ({ errorMessage }: { errorMessage: string }) => {
        callLog.push('reply:failure');

        return { failed: true, reason: errorMessage };
      },
    );
  });

  it('should decline an unlinked Slack user when access is restricted to linked members', async () => {
    resolveSlackAccessDecisionMock.mockResolvedValue({ status: 'DENIED' });

    await expect(slackAssistantWorkerHandler(REQUEST_RECORD)).resolves.toEqual({
      done: true,
      declined: true,
    });

    expect(runSlackAssistantAgentWithDeadlineMock).not.toHaveBeenCalled();
    expect(sendSlackMessageMock).toHaveBeenCalledTimes(1);
    expect(sendSlackMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ messageText: SLACK_ACCESS_DENIED_TEXT }),
    );
    expect(updateSlackAssistantRequestMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: REQUEST_RECORD.id,
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: SLACK_ACCESS_DENIED_TEXT,
      }),
    );
  });

  it('should fail the request when the denial message cannot be delivered', async () => {
    resolveSlackAccessDecisionMock.mockResolvedValue({ status: 'DENIED' });
    sendSlackMessageMock.mockImplementation(async () => {
      callLog.push('reply:denied');

      return { success: false, message: 'channel_not_found' };
    });

    const result = await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(result).toEqual(expect.objectContaining({ failed: true }));
    expect(finishSlackAssistantRequestWithFailureMock).toHaveBeenCalledTimes(1);
    expect(updateSlackAssistantRequestMock).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: SLACK_ACCESS_DENIED_TEXT,
      }),
    );
  });

  it('should fail rather than deny when access could not be established', async () => {
    resolveSlackAccessDecisionMock.mockResolvedValue({
      status: 'UNVERIFIABLE',
    });

    const result = await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(result).toEqual(expect.objectContaining({ failed: true }));
    expect(finishSlackAssistantRequestWithFailureMock).toHaveBeenCalledTimes(1);
    expect(runSlackAssistantAgentWithDeadlineMock).not.toHaveBeenCalled();
    expect(sendSlackMessageMock).not.toHaveBeenCalled();
    expect(updateSlackAssistantRequestMock).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ responseText: SLACK_ACCESS_DENIED_TEXT }),
    );
  });

  it('should ask for the access decision with the channel policy mode and the resolved requester', async () => {
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({
      status: 'ANSWER',
      accessMode: SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS,
      capability: 'FULL',
      isChannelRule: false,
    });
    resolveSlackRunAsForRequestMock.mockResolvedValue('workspace-member-1');
    fetchSlackAssistantContextMock.mockImplementation(async () => {
      callLog.push('context:fetch');

      return {
        ...SLACK_CONTEXT,
        slackClient: {},
        requesterIdentity: REQUESTER_IDENTITY,
      };
    });

    await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(resolveSlackChannelAccessPolicyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slackChannelId: REQUEST_RECORD.slackChannelId,
        isDirectMessage: true,
      }),
    );
    expect(resolveSlackAccessDecisionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accessMode: SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS,
        identity: REQUESTER_IDENTITY,
        runAsWorkspaceMemberId: 'workspace-member-1',
      }),
    );
  });

  it('should word the denial for the channel when a channel rule restricts it', async () => {
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({
      status: 'ANSWER',
      accessMode: SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS,
      capability: 'FULL',
      isChannelRule: true,
    });
    resolveSlackAccessDecisionMock.mockResolvedValue({ status: 'DENIED' });

    await expect(slackAssistantWorkerHandler(REQUEST_RECORD)).resolves.toEqual({
      done: true,
      declined: true,
    });

    expect(sendSlackMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        messageText: SLACK_CHANNEL_ACCESS_DENIED_TEXT,
      }),
    );
    expect(updateSlackAssistantRequestMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: SLACK_CHANNEL_ACCESS_DENIED_TEXT,
      }),
    );
  });

  it('should run the full assistant agent when the channel is not capped', async () => {
    await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(runSlackAssistantAgentWithDeadlineMock).toHaveBeenCalledWith(
      expect.objectContaining({
        agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('should run the read-only assistant agent when the channel rule caps it at reading', async () => {
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({
      status: 'ANSWER',
      accessMode: SLACK_ACCESS_MODE.ANYONE,
      capability: 'READ_ONLY',
      isChannelRule: true,
    });

    await expect(slackAssistantWorkerHandler(REQUEST_RECORD)).resolves.toEqual({
      done: true,
    });

    expect(runSlackAssistantAgentWithDeadlineMock).toHaveBeenCalledWith(
      expect.objectContaining({
        agentUniversalIdentifier:
          SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('should close a request from a silenced channel without answering or running the agent', async () => {
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({ status: 'SILENT' });

    await expect(slackAssistantWorkerHandler(REQUEST_RECORD)).resolves.toEqual({
      done: true,
      silenced: true,
    });

    expect(callLog).toEqual(['status:start', 'context:fetch', 'status:stop']);
    expect(runSlackAssistantAgentWithDeadlineMock).not.toHaveBeenCalled();
    expect(sendSlackMessageMock).not.toHaveBeenCalled();
    expect(resolveSlackAccessDecisionMock).not.toHaveBeenCalled();
    expect(updateSlackAssistantRequestMock).toHaveBeenCalledWith(
      expect.anything(),
      { id: REQUEST_RECORD.id, status: SLACK_ASSISTANT_REQUEST_STATUS.DONE },
    );
  });

  it('should tell the requester privately when the channel was silenced after the request was enqueued', async () => {
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({ status: 'SILENT' });

    await slackAssistantWorkerHandler({
      ...REQUEST_RECORD,
      slackChannelId: 'C0FIN',
      slackChannelType: 'channel',
      slackThreadTimestamp: '1700000000.000001',
    });

    expect(notifySilencedSlackChannelMock).toHaveBeenCalledWith({
      slackChannelId: 'C0FIN',
      slackUserId: 'U123',
      parentMessageTimestamp: '1700000000.000001',
    });
  });

  it('should fail rather than answer when the channel rule cannot be read', async () => {
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({
      status: 'UNREADABLE',
    });

    const result = await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(result).toEqual({
      failed: true,
      reason: SLACK_CHANNEL_RULE_UNREADABLE_ERROR,
    });
    expect(stopStatusUpdatesMock).toHaveBeenCalledTimes(1);
    expect(runSlackAssistantAgentWithDeadlineMock).not.toHaveBeenCalled();
    expect(resolveSlackAccessDecisionMock).not.toHaveBeenCalled();
  });

  it('should answer a request access allowed', async () => {
    resolveSlackChannelAccessPolicyMock.mockResolvedValue({
      status: 'ANSWER',
      accessMode: SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS,
      capability: 'FULL',
      isChannelRule: false,
    });
    resolveSlackRunAsForRequestMock.mockResolvedValue(undefined);

    await expect(slackAssistantWorkerHandler(REQUEST_RECORD)).resolves.toEqual({
      done: true,
    });

    expect(runSlackAssistantAgentWithDeadlineMock).toHaveBeenCalledTimes(1);
  });

  it('should show the thinking status before fetching the Slack context', async () => {
    await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(callLog).toEqual([
      'status:start',
      'context:fetch',
      'agent:run',
      'status:stop',
      'reply:answer',
    ]);
    expect(
      startSlackAssistantStatusUpdatesMock,
    ).toHaveBeenCalledExactlyOnceWith({
      slackChannelId: REQUEST_RECORD.slackChannelId,
      threadTimestamp: REQUEST_RECORD.slackMessageTimestamp,
    });
  });

  it('should stop the status before the failure reply when the context lookup throws', async () => {
    fetchSlackAssistantContextMock.mockImplementation(async () => {
      callLog.push('context:fetch');

      throw new Error('Slack is unreachable');
    });

    const result = await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(result).toEqual({ failed: true, reason: 'Slack is unreachable' });
    expect(callLog).toEqual([
      'status:start',
      'context:fetch',
      'status:stop',
      'reply:failure',
    ]);
    expect(runSlackAssistantAgentWithDeadlineMock).not.toHaveBeenCalled();
  });

  it('should stop the status before the failure reply when the agent fails', async () => {
    runSlackAssistantAgentWithDeadlineMock.mockImplementation(async () => {
      callLog.push('agent:run');

      return { success: false, error: 'Agent crashed', result: null };
    });

    const result = await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(result).toEqual({ failed: true, reason: 'Agent crashed' });
    expect(callLog).toEqual([
      'status:start',
      'context:fetch',
      'agent:run',
      'status:stop',
      'reply:failure',
    ]);
    expect(stopStatusUpdatesMock).toHaveBeenCalledOnce();
  });

  it('should run the agent against the deadline it was handed', async () => {
    const agentDeadlineAtMs = Date.now() + 60_000;

    await slackAssistantWorkerHandler(REQUEST_RECORD, { agentDeadlineAtMs });

    expect(runSlackAssistantAgentWithDeadlineMock).toHaveBeenCalledWith(
      expect.objectContaining({ deadlineAtMs: agentDeadlineAtMs }),
    );
  });

  it('should leave a request another execution already claimed alone', async () => {
    claimSlackAssistantRequestMock.mockResolvedValue(false);

    const result = await slackAssistantWorkerHandler(REQUEST_RECORD);

    expect(result).toEqual({
      skipped: true,
      reason: 'Request is already being processed',
    });
    expect(callLog).toEqual([]);
    expect(fetchSlackAssistantContextMock).not.toHaveBeenCalled();
  });

  it('should take over a request whose execution died mid-answer', async () => {
    const result = await slackAssistantWorkerHandler({
      ...REQUEST_RECORD,
      status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
      updatedAt: new Date(
        Date.now() - (SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 1) * 1000,
      ).toISOString(),
    });

    expect(result).toEqual({ done: true });
    expect(claimSlackAssistantRequestMock).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      { id: REQUEST_RECORD.id },
    );
  });

  it('should leave a request whose execution can still be alive alone', async () => {
    const result = await slackAssistantWorkerHandler({
      ...REQUEST_RECORD,
      status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
      updatedAt: new Date().toISOString(),
    });

    expect(result).toEqual({ skipped: true, reason: 'Request is not pending' });
    expect(claimSlackAssistantRequestMock).not.toHaveBeenCalled();
  });

  it('should not start the status for a request that is no longer pending', async () => {
    const result = await slackAssistantWorkerHandler({
      ...REQUEST_RECORD,
      status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
    });

    expect(result).toEqual({ skipped: true, reason: 'Request is not pending' });
    expect(claimSlackAssistantRequestMock).not.toHaveBeenCalled();
    expect(startSlackAssistantStatusUpdatesMock).not.toHaveBeenCalled();
  });
});
