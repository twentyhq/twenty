import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

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
const COMPLETED_RUN = {
  status: 'COMPLETED',
  result: { response: 'Acme is your biggest customer' },
  error: null,
};

const buildService = () => {
  const agentRunnerService = {
    start: jest.fn().mockResolvedValue(undefined),
  };
  const agentRunSettlementService = {
    waitFor: jest.fn().mockResolvedValue(COMPLETED_RUN),
    publish: jest.fn().mockResolvedValue(undefined),
  };
  const agentRunSuspensionService = {
    assertConversationNotSuspended: jest.fn().mockResolvedValue(undefined),
  };
  const agentActorContextService = {
    buildRunAsWorkspaceMemberContext: jest.fn().mockResolvedValue({
      actorContext: RUN_AS_ACTOR,
      authContext: {
        type: 'user',
        userWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
        workspaceMemberId: RUN_AS_ACTOR.workspaceMemberId,
      },
      roleId: 'role-id',
    }),
    buildApplicationAgentContext: jest.fn().mockResolvedValue({
      application: APPLICATION,
      authContext: {
        type: 'application',
        workspace: WORKSPACE,
        application: APPLICATION,
      },
      agentRoleId: 'agent-role-id',
    }),
  };
  const apiKeyRoleService = {
    getRoleIdForApiKeyId: jest.fn().mockResolvedValue('api-key-role-id'),
  };
  const apiKeyService = {
    validateApiKey: jest.fn().mockResolvedValue({
      id: 'api-key-id',
      workspaceId: 'workspace-id',
      name: 'Agent integration',
      expiresAt: new Date('2099-01-01'),
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      revokedAt: null,
    }),
  };

  const service = new AgentRunService(
    agentActorContextService as never,
    agentRunnerService as never,
    agentRunSettlementService as never,
    agentRunSuspensionService as never,
    {} as never,
    apiKeyRoleService as never,
    apiKeyService as never,
    { findById: jest.fn().mockResolvedValue(APPLICATION) } as never,
    { findOne: jest.fn().mockResolvedValue(AGENT) } as never,
  );

  return {
    service,
    agentRunnerService,
    agentRunSettlementService,
    agentRunSuspensionService,
    agentActorContextService,
    apiKeyRoleService,
    apiKeyService,
  };
};

const runInput = (agentRunnerService: { start: jest.Mock }) =>
  agentRunnerService.start.mock.calls[0][0];

// how the run acts is read from its caller in the job, as when it goes on after a pause
const runExecutionContext = (
  service: AgentRunService,
  agentRunnerService: { start: jest.Mock },
) =>
  service.buildExecutionContext({
    workspaceId: 'workspace-id',
    caller: JSON.parse(JSON.stringify(runInput(agentRunnerService).caller)),
  });

const run = (
  service: AgentRunService,
  input: Record<string, unknown>,
  {
    isCalledByApplication = true,
    requestUserWorkspaceId = null,
    requestWorkspaceMemberId = null,
  }: {
    isCalledByApplication?: boolean;
    requestUserWorkspaceId?: string | null;
    requestWorkspaceMemberId?: string | null;
  } = {},
) =>
  service.run({
    workspace: WORKSPACE,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    callerApplication: isCalledByApplication
      ? (APPLICATION as never)
      : undefined,
    input: { agentUniversalIdentifier: AGENT.universalIdentifier, ...input },
  });

const userInput = (content: string) => [{ role: 'user', content }];

describe('AgentRunService', () => {
  it('runs without a thread in a new conversation of its own', async () => {
    const { service, agentRunnerService } = buildService();

    const result = await run(service, {
      input: userInput('Who is our biggest customer?'),
    });
    const secondResult = await run(service, {
      input: userInput('Who is our biggest customer?'),
    });

    expect(result).toEqual({
      threadId: expect.any(String),
      status: 'COMPLETED',
      result: { response: 'Acme is your biggest customer' },
      error: null,
      success: true,
    });
    expect(secondResult.threadId).not.toBe(result.threadId);

    const { conversation, spec, prompt } = runInput(agentRunnerService);
    const executionContext = await runExecutionContext(
      service,
      agentRunnerService,
    );

    expect(conversation).toEqual({
      threadId: result.threadId,
      isCreated: true,
    });
    expect(spec).toMatchObject({
      title: AGENT.label,
      toolLoadingStrategy: 'lazy',
      capabilities: {
        canAskHumans: false,
      },
    });
    expect(prompt).toEqual({
      senderUserWorkspaceId: null,
      senderApplicationId: APPLICATION.id,
      messages: userInput('Who is our biggest customer?'),
    });
    expect(executionContext).toMatchObject({
      rolePermissionConfig: {
        intersectionOf: { agentRoleId: 'agent-role-id' },
      },
      conversationActor: { type: 'application', applicationId: APPLICATION.id },
      turnCreatedBy: { source: 'APPLICATION' },
    });
  });

  it('keeps the replies a run without a thread hands over as its input', async () => {
    const { service, agentRunnerService } = buildService();
    const history = [
      { role: 'user', content: 'Who is our biggest customer?' },
      { role: 'assistant', content: 'Acme.' },
      { role: 'user', content: 'And the second one?' },
    ];

    await run(service, { input: history });

    expect(runInput(agentRunnerService).prompt.messages).toEqual(history);
  });

  it('keeps accepting a prompt', async () => {
    const { service, agentRunnerService } = buildService();

    await run(service, { prompt: 'Who is our biggest customer?' });

    expect(runInput(agentRunnerService).prompt.messages).toEqual(
      userInput('Who is our biggest customer?'),
    );
  });

  it('continues the thread as the member it runs as', async () => {
    const { service, agentRunnerService } = buildService();
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

    const { conversation, caller, prompt } = runInput(agentRunnerService);
    const executionContext = await runExecutionContext(
      service,
      agentRunnerService,
    );

    expect(result.threadId).toBe(threadId);
    expect(conversation).toEqual({ threadId, isCreated: false });
    expect(caller).toEqual({
      type: 'AGENT_API_RUN',
      ref: {
        runId: expect.any(String),
        agentId: AGENT.id,
        runAsWorkspaceMemberId: 'workspace-member-id',
        requestUserWorkspaceId: null,
        createdBy: RUN_AS_ACTOR,
      },
    });
    expect(prompt).toMatchObject({
      senderUserWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
    });
    expect(executionContext).toMatchObject({
      actorContext: RUN_AS_ACTOR,
      turnCreatedBy: RUN_AS_ACTOR,
      userWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
      agentRunRoleIds: { userWorkspaceRoleId: 'role-id' },
      rolePermissionConfig: {
        intersectionOf: {
          agentRoleId: 'agent-role-id',
          userWorkspaceRoleId: 'role-id',
        },
      },
      conversationActor: {
        type: 'user',
        workspaceMemberId: RUN_AS_ACTOR.workspaceMemberId,
      },
    });
  });

  it('keeps the additional instructions with the run rather than in its messages', async () => {
    const { service, agentRunnerService } = buildService();

    await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'thread', title: 'Acme renewal' },
      additionalInstructions: 'Answer in Slack markdown',
    });

    const { spec, prompt } = runInput(agentRunnerService);

    expect(spec).toMatchObject({
      title: 'Acme renewal',
      instructions: 'Answer in Slack markdown',
    });
    expect(prompt).toMatchObject({
      messages: userInput('And the second one?'),
      senderUserWorkspaceId: null,
    });
  });

  it('keeps the output format the call asks for with the run', async () => {
    const { service, agentRunnerService } = buildService();
    const responseFormat = {
      type: 'json' as const,
      schema: {
        type: 'object' as const,
        properties: { summary: { type: 'string' as const } },
      },
    };

    await run(service, { input: userInput('Summarize'), responseFormat });

    expect(runInput(agentRunnerService).spec).toMatchObject({ responseFormat });
  });

  it('refuses an output format that is not one', async () => {
    const { service, agentRunnerService } = buildService();

    await expect(
      run(service, {
        input: userInput('Summarize'),
        responseFormat: { type: 'json', schema: { properties: 'nope' } },
      }),
    ).rejects.toThrow('Invalid response format');
    expect(agentRunnerService.start).not.toHaveBeenCalled();
  });

  it('records the member who called without an application as the sender', async () => {
    const { service, agentRunnerService } = buildService();

    await run(
      service,
      { input: userInput('Who is our biggest customer?') },
      {
        isCalledByApplication: false,
        requestUserWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
        requestWorkspaceMemberId: RUN_AS_ACTOR.workspaceMemberId,
      },
    );

    expect(runInput(agentRunnerService).prompt).toMatchObject({
      senderUserWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
      senderApplicationId: null,
    });
  });

  it.each([false, true])(
    'keeps the member identity when an implicit member run resumes (application caller: %s)',
    async (isCalledByApplication) => {
      const { service, agentRunnerService, agentActorContextService } =
        buildService();

      await run(
        service,
        { prompt: 'Hello' },
        {
          isCalledByApplication,
          requestUserWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
          requestWorkspaceMemberId: RUN_AS_ACTOR.workspaceMemberId,
        },
      );

      const { caller } = runInput(agentRunnerService);
      const executionContext = await runExecutionContext(
        service,
        agentRunnerService,
      );

      expect(executionContext).toMatchObject({
        authContext: {
          type: 'user',
          userWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
        },
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: 'agent-role-id',
            userWorkspaceRoleId: 'role-id',
          },
        },
        turnCreatedBy: RUN_AS_ACTOR,
      });

      agentActorContextService.buildRunAsWorkspaceMemberContext.mockResolvedValue(
        {
          actorContext: RUN_AS_ACTOR,
          authContext: {
            type: 'user',
            userWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
            workspaceMemberId: RUN_AS_ACTOR.workspaceMemberId,
          },
          roleId: 'updated-member-role-id',
        },
      );

      const resumedContext = await service.buildExecutionContext({
        workspaceId: 'workspace-id',
        caller: JSON.parse(JSON.stringify(caller)),
      });

      expect(resumedContext).toMatchObject({
        authContext: executionContext.authContext,
        conversationActor: {
          type: 'user',
          workspaceMemberId: RUN_AS_ACTOR.workspaceMemberId,
        },
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: 'agent-role-id',
            userWorkspaceRoleId: 'updated-member-role-id',
          },
        },
      });
    },
  );

  it('releases an implicit member run when the member leaves', async () => {
    const { service, agentRunnerService, agentActorContextService } =
      buildService();

    await run(
      service,
      { prompt: 'Hello' },
      {
        isCalledByApplication: false,
        requestUserWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
        requestWorkspaceMemberId: RUN_AS_ACTOR.workspaceMemberId,
      },
    );

    agentActorContextService.buildRunAsWorkspaceMemberContext.mockRejectedValue(
      new AiException(
        'Member left',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
      ),
    );

    await expect(
      service.getWaitingState({
        workspaceId: 'workspace-id',
        caller: runInput(agentRunnerService).caller,
      }),
    ).resolves.toBe('GONE');
  });

  it('keeps the API key and reloads its role when a run resumes', async () => {
    const { service, agentRunnerService, apiKeyRoleService } = buildService();

    await service.run({
      workspace: WORKSPACE,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApiKey: { id: 'api-key-id' } as never,
      input: {
        agentUniversalIdentifier: AGENT.universalIdentifier,
        prompt: 'Hello',
      },
    });

    const { caller } = runInput(agentRunnerService);
    const executionContext = await runExecutionContext(
      service,
      agentRunnerService,
    );

    expect(executionContext).toMatchObject({
      authContext: { type: 'apiKey', apiKey: { id: 'api-key-id' } },
      rolePermissionConfig: {
        intersectionOf: {
          agentRoleId: 'agent-role-id',
          apiKeyRoleId: 'api-key-role-id',
        },
      },
    });

    apiKeyRoleService.getRoleIdForApiKeyId.mockResolvedValue(
      'updated-key-role-id',
    );

    await expect(
      service.buildExecutionContext({
        workspaceId: 'workspace-id',
        caller: JSON.parse(JSON.stringify(caller)),
      }),
    ).resolves.toMatchObject({
      authContext: { type: 'apiKey', apiKey: { id: 'api-key-id' } },
      rolePermissionConfig: {
        intersectionOf: {
          agentRoleId: 'agent-role-id',
          apiKeyRoleId: 'updated-key-role-id',
        },
      },
    });
  });

  it.each([
    ApiKeyExceptionCode.API_KEY_REVOKED,
    ApiKeyExceptionCode.API_KEY_EXPIRED,
    ApiKeyExceptionCode.API_KEY_NOT_FOUND,
  ])(
    'releases a waiting run when its API key is unavailable: %s',
    async (code) => {
      const { service, agentRunnerService, apiKeyService } = buildService();

      await service.run({
        workspace: WORKSPACE,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        callerApiKey: { id: 'api-key-id' } as never,
        input: {
          agentUniversalIdentifier: AGENT.universalIdentifier,
          prompt: 'Hello',
        },
      });

      apiKeyService.validateApiKey.mockRejectedValue(
        new ApiKeyException('Key unavailable', code),
      );

      await expect(
        service.getWaitingState({
          workspaceId: 'workspace-id',
          caller: runInput(agentRunnerService).caller,
        }),
      ).resolves.toBe('GONE');
      await expect(
        service.buildExecutionContext({
          workspaceId: 'workspace-id',
          caller: runInput(agentRunnerService).caller,
        }),
      ).rejects.toMatchObject({ code });
    },
  );

  it('refuses a caller without a member, application or API key', async () => {
    const { service, agentRunnerService } = buildService();

    await expect(
      run(service, { prompt: 'Hello' }, { isCalledByApplication: false }),
    ).rejects.toMatchObject({ code: AiExceptionCode.RUN_AGENT_NOT_ALLOWED });
    expect(agentRunnerService.start).not.toHaveBeenCalled();
  });

  it('reports a run that ran out of credits', async () => {
    const { service, agentRunSettlementService } = buildService();

    agentRunSettlementService.waitFor.mockResolvedValue({
      status: 'FAILED',
      result: null,
      error: 'Agent stopped: no more available credits.',
    });

    await expect(
      run(service, { input: userInput('Hello') }),
    ).resolves.toMatchObject({
      status: 'FAILED',
      success: false,
      error: 'Agent stopped: no more available credits.',
    });
  });

  it('answers a run that outlasts the wait as running', async () => {
    const { service, agentRunSettlementService } = buildService();

    agentRunSettlementService.waitFor.mockResolvedValue(null);

    await expect(
      run(service, { input: userInput('Hello') }),
    ).resolves.toMatchObject({ status: 'RUNNING', success: true });
  });

  it('starts the run without waiting when asked not to', async () => {
    const { service, agentRunnerService, agentRunSettlementService } =
      buildService();

    const result = await run(service, {
      input: userInput('Hello'),
      waitForCompletion: false,
    });

    expect(result).toEqual({
      threadId: runInput(agentRunnerService).conversation.threadId,
      status: 'RUNNING',
      result: null,
      error: null,
      success: true,
    });
    expect(agentRunSettlementService.waitFor).not.toHaveBeenCalled();
  });

  it('refuses to continue a conversation waiting on an earlier run', async () => {
    const { service, agentRunnerService, agentRunSuspensionService } =
      buildService();

    agentRunSuspensionService.assertConversationNotSuspended.mockRejectedValue(
      new AiException('Waiting', AiExceptionCode.THREAD_AWAITING_ANSWER),
    );

    await expect(
      run(service, { input: userInput('Hello'), thread: { key: 'thread' } }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_AWAITING_ANSWER });
    expect(agentRunnerService.start).not.toHaveBeenCalled();
  });

  it('tells the waiting call how its run settled', async () => {
    const { service, agentRunnerService, agentRunSettlementService } =
      buildService();

    await run(service, { input: userInput('Hello') });

    const { caller } = runInput(agentRunnerService);

    await service.onSuspended({ workspaceId: 'workspace-id', caller });
    await service.onOutcome({
      workspaceId: 'workspace-id',
      caller,
      outcome: { status: 'FAILED', error: 'provider down' },
    });

    expect(agentRunSettlementService.publish.mock.calls).toEqual([
      [
        {
          runId: caller.ref.runId,
          settledRun: { status: 'SUSPENDED', result: null, error: null },
        },
      ],
      [
        {
          runId: caller.ref.runId,
          settledRun: {
            status: 'FAILED',
            result: null,
            error: 'provider down',
          },
        },
      ],
    ]);
  });

  it('fails the waiting call when its agent or key went away before the run ended', async () => {
    const { service, agentRunnerService, agentRunSettlementService } =
      buildService();

    await run(service, { input: userInput('Hello') });

    const { caller } = runInput(agentRunnerService);

    await service.onCallerGone({
      workspaceId: 'workspace-id',
      caller,
      outcome: { status: 'COMPLETED', result: { response: 'Done' } },
    });

    expect(agentRunSettlementService.publish).toHaveBeenCalledWith({
      runId: caller.ref.runId,
      settledRun: {
        status: 'FAILED',
        result: null,
        error: 'The agent or the key that started this run is gone',
      },
    });
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
    const { service, agentRunnerService } = buildService();

    await expect(
      run(service, { input: userInput('Hello'), thread: { key: '  ' } }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
    expect(agentRunnerService.start).not.toHaveBeenCalled();
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
