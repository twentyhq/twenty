import { Logger } from '@nestjs/common';

import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE = { id: 'workspace-id' } as never;
const APPLICATION = { id: 'application-id' };
const AGENT = {
  id: 'agent-id',
  label: 'Slack Assistant',
  applicationId: APPLICATION.id,
  universalIdentifier: 'slack-assistant',
};
const RUN_AS_USER_WORKSPACE_ID = 'user-workspace-id';
const RUN_AS_ACTOR = {
  source: 'API',
  name: 'Tim Apple',
  workspaceMemberId: 'workspace-member-id',
  context: {},
};
const PRIOR_MESSAGES = [{ id: 'message-1', role: 'user', parts: [] }];

const buildService = () => {
  const executionResult = {
    result: { response: 'Acme is your biggest customer' },
    hasNoMoreAvailableCredits: false,
    steps: [],
  };
  const agentAsyncExecutorService = {
    executeAgent: jest.fn().mockResolvedValue(executionResult),
  };
  const agentRunConversationService = {
    openTurn: jest.fn().mockResolvedValue('turn-id'),
    closeTurn: jest.fn().mockResolvedValue(undefined),
    failTurn: jest.fn().mockResolvedValue(undefined),
    withThreadLock: jest.fn(({ work }) => work()),
  };
  const conversationReaderService = {
    loadMessages: jest.fn().mockResolvedValue(PRIOR_MESSAGES),
  };
  const agentActorContextService = {
    buildRunAsWorkspaceMemberContext: jest.fn().mockResolvedValue({
      actorContext: RUN_AS_ACTOR,
      authContext: { userWorkspaceId: RUN_AS_USER_WORKSPACE_ID },
      roleId: 'role-id',
    }),
  };

  const service = new AgentRunService(
    agentActorContextService as never,
    agentAsyncExecutorService as never,
    agentRunConversationService as never,
    { findById: jest.fn().mockResolvedValue(APPLICATION) } as never,
    conversationReaderService as never,
    { findOne: jest.fn().mockResolvedValue(AGENT) } as never,
  );

  return {
    service,
    executionResult,
    agentAsyncExecutorService,
    agentRunConversationService,
    conversationReaderService,
  };
};

const run = (
  service: AgentRunService,
  input: Record<string, unknown>,
  {
    isCalledByApplication = true,
    requestUserWorkspaceId = null,
  }: {
    isCalledByApplication?: boolean;
    requestUserWorkspaceId?: string | null;
  } = {},
) =>
  service.run({
    workspace: WORKSPACE,
    requestUserWorkspaceId,
    requestWorkspaceMemberId: null,
    callerApplication: isCalledByApplication
      ? (APPLICATION as never)
      : undefined,
    input: { agentUniversalIdentifier: AGENT.universalIdentifier, ...input },
  });

const userInput = (content: string) => [{ role: 'user', content }];

describe('AgentRunService', () => {
  it('records a run without a thread in a conversation of its own', async () => {
    const {
      service,
      agentAsyncExecutorService,
      agentRunConversationService,
      conversationReaderService,
    } = buildService();

    const result = await run(service, {
      input: userInput('Who is our biggest customer?'),
    });
    const secondResult = await run(service, {
      input: userInput('Who is our biggest customer?'),
    });

    expect(result).toEqual({
      result: { response: 'Acme is your biggest customer' },
      error: null,
      success: true,
      threadId: expect.any(String),
    });
    expect(secondResult.threadId).not.toBe(result.threadId);
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: secondResult.threadId }),
    );
    expect(agentRunConversationService.closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: secondResult.threadId }),
    );
    expect(conversationReaderService.loadMessages).not.toHaveBeenCalled();
    expect(agentRunConversationService.withThreadLock).not.toHaveBeenCalled();
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: result.threadId,
        title: AGENT.label,
        senderUserWorkspaceId: null,
        senderApplicationId: APPLICATION.id,
        createdBy: expect.objectContaining({ source: 'APPLICATION' }),
        messages: userInput('Who is our biggest customer?'),
      }),
    );
    expect(agentRunConversationService.closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: result.threadId, turnId: 'turn-id' }),
    );
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ priorMessages: [] }),
    );
  });

  it('keeps the replies a run without a thread hands over as its input', async () => {
    const { service, agentRunConversationService } = buildService();
    const history = [
      { role: 'user', content: 'Who is our biggest customer?' },
      { role: 'assistant', content: 'Acme.' },
      { role: 'user', content: 'And the second one?' },
    ];

    await run(service, { input: history });

    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith(
      expect.objectContaining({ messages: history }),
    );
  });

  it('keeps accepting a prompt', async () => {
    const { service, agentAsyncExecutorService } = buildService();

    await run(service, { prompt: 'Who is our biggest customer?' });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: userInput('Who is our biggest customer?'),
      }),
    );
  });

  it('continues the thread as the member it runs as', async () => {
    const {
      service,
      executionResult,
      agentAsyncExecutorService,
      agentRunConversationService,
      conversationReaderService,
    } = buildService();
    const threadId = buildAgentRunThreadId({
      applicationId: APPLICATION.id,
      agentId: AGENT.id,
      threadKey: 'C123:1700000000.000100',
    });

    const result = await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'C123:1700000000.000100' },
      runAsWorkspaceMemberId: 'workspace-member-id',
    });

    const actor = { type: 'user', userWorkspaceId: RUN_AS_USER_WORKSPACE_ID };

    expect(result.threadId).toBe(threadId);
    expect(agentRunConversationService.withThreadLock).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: 'workspace-id', threadId }),
    );
    expect(conversationReaderService.loadMessages).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId,
      actor,
    });
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ priorMessages: PRIOR_MESSAGES }),
    );
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId,
        title: AGENT.label,
        senderUserWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
        createdBy: RUN_AS_ACTOR,
        messages: userInput('And the second one?'),
      }),
    );
    expect(agentRunConversationService.closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId,
        turnId: 'turn-id',
        execution: executionResult,
      }),
    );
  });

  it('gives the additional instructions to the model without recording them', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();

    await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'thread', title: 'Acme renewal' },
      additionalInstructions: 'Answer in Slack markdown',
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: userInput('Answer in Slack markdown\n\nAnd the second one?'),
      }),
    );
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Acme renewal',
        messages: userInput('And the second one?'),
        senderUserWorkspaceId: null,
      }),
    );
  });

  it('records the member who called without an application as the sender', async () => {
    const { service, agentRunConversationService } = buildService();

    await run(
      service,
      { input: userInput('Who is our biggest customer?') },
      {
        isCalledByApplication: false,
        requestUserWorkspaceId: 'caller-user-workspace-id',
      },
    );

    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        senderUserWorkspaceId: 'caller-user-workspace-id',
        senderApplicationId: null,
      }),
    );
  });

  it('still returns the reply when the turn cannot be recorded', async () => {
    const { service, agentRunConversationService } = buildService();

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    agentRunConversationService.openTurn.mockRejectedValue(
      new Error('write failed'),
    );

    const result = await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'thread' },
    });

    expect(result.success).toBe(true);
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
  });

  it('records the turn as failed when the execution throws', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();
    const executionError = new Error('provider down');

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    agentAsyncExecutorService.executeAgent.mockRejectedValue(executionError);

    const result = await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'thread' },
    });

    expect(result.success).toBe(false);
    expect(agentRunConversationService.failTurn).toHaveBeenCalledWith(
      expect.objectContaining({ turnId: 'turn-id', error: executionError }),
    );
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
  });

  it('refuses a thread without an application token', async () => {
    const { service } = buildService();

    await expect(
      run(
        service,
        { input: userInput('Hello'), thread: { key: 'thread' } },
        { isCalledByApplication: false },
      ),
    ).rejects.toMatchObject({ code: AiExceptionCode.RUN_AGENT_NOT_ALLOWED });
  });

  it('refuses a thread with a blank key', async () => {
    const { service, agentAsyncExecutorService } = buildService();

    await expect(
      run(service, { input: userInput('Hello'), thread: { key: '  ' } }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('refuses assistant messages sent to a thread', async () => {
    const { service } = buildService();

    await expect(
      run(service, {
        thread: { key: 'thread' },
        input: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi' },
        ],
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
  });
});
