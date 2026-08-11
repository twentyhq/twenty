import { Test, type TestingModule } from '@nestjs/testing';

import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('AgentRunService', () => {
  let service: AgentRunService;
  let agentRepository: { findOne: jest.Mock };
  let applicationService: { findById: jest.Mock };
  let agentAsyncExecutorService: { executeAgent: jest.Mock };
  let agentActorContextService: {
    buildRunAsWorkspaceMemberContext: jest.Mock;
  };

  const workspace = { id: 'workspace-1' } as FlatWorkspace;

  const agent = { id: 'agent-1', applicationId: 'app-1' } as AgentEntity;

  const input = {
    agentUniversalIdentifier: 'agent-uid',
    prompt: 'Enrich record 123',
  };

  const callerApplication = { id: 'app-1' } as FlatApplication;

  const runAsActorContext = {
    source: 'AGENT',
    workspaceMemberId: 'workspace-member-1',
  };

  const runAsAuthContext = {
    type: 'user',
    workspace,
    userWorkspaceId: 'member-user-workspace-1',
    user: { id: 'user-1' },
    workspaceMemberId: 'workspace-member-1',
    workspaceMember: { id: 'workspace-member-1' },
  };

  beforeEach(async () => {
    agentRepository = { findOne: jest.fn().mockResolvedValue(agent) };
    applicationService = {
      findById: jest.fn().mockResolvedValue({ id: 'app-1' }),
    };
    agentAsyncExecutorService = {
      executeAgent: jest.fn().mockResolvedValue({
        result: { response: 'done' },
        hasNoMoreAvailableCredits: false,
      }),
    };
    agentActorContextService = {
      buildRunAsWorkspaceMemberContext: jest.fn().mockResolvedValue({
        actorContext: runAsActorContext,
        authContext: runAsAuthContext,
        roleId: 'member-role-1',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentRunService,
        {
          provide: AgentActorContextService,
          useValue: agentActorContextService,
        },
        {
          provide: AgentAsyncExecutorService,
          useValue: agentAsyncExecutorService,
        },
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(AgentEntity),
          useValue: agentRepository,
        },
      ],
    }).compile();

    service = module.get(AgentRunService);
  });

  it('runs the agent found by its universal identifier and returns a success result', async () => {
    const result = await service.run({
      workspace,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: null,
      input,
    });

    expect(agentRepository.findOne).toHaveBeenCalledWith(workspace.id, {
      where: {
        universalIdentifier: input.agentUniversalIdentifier,
      },
    });
    expect(applicationService.findById).toHaveBeenCalledWith(
      agent.applicationId,
    );
    expect(result).toEqual({
      result: { response: 'done' },
      error: null,
      success: true,
    });
  });

  it('builds the application auth context from the agent application', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: null,
      input,
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: input.prompt }],
        authContext: {
          type: 'application',
          workspace,
          application: { id: 'app-1' },
        },
      }),
    );
  });

  it('does not resolve a run-as context when no workspace member is requested', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: null,
      input,
    });

    expect(
      agentActorContextService.buildRunAsWorkspaceMemberContext,
    ).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorContext: undefined,
        runAsRoleId: undefined,
      }),
    );
  });

  it('converts a prompt into a single user message', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      input,
    });

    expect(
      agentAsyncExecutorService.executeAgent.mock.calls[0][0].messages,
    ).toEqual([{ role: 'user', content: input.prompt }]);
  });

  it('runs as the requested workspace member with their auth context and role', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication,
      input: { ...input, runAsWorkspaceMemberId: 'workspace-member-1' },
    });

    expect(
      agentActorContextService.buildRunAsWorkspaceMemberContext,
    ).toHaveBeenCalledWith({
      workspaceMemberId: 'workspace-member-1',
      workspaceId: workspace.id,
    });
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorContext: runAsActorContext,
        authContext: runAsAuthContext,
        runAsRoleId: 'member-role-1',
        userWorkspaceId: 'member-user-workspace-1',
      }),
    );
  });

  it('fails the run instead of falling back to the agent role when the member cannot be resolved', async () => {
    agentActorContextService.buildRunAsWorkspaceMemberContext.mockRejectedValue(
      new AiException(
        'Workspace member not found',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
      ),
    );

    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        callerApplication,
        input: { ...input, runAsWorkspaceMemberId: 'workspace-member-1' },
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
    });

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('passes messages to the executor when messages are provided instead of prompt', async () => {
    const messages = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi there' },
      { role: 'user' as const, content: 'What is the status?' },
    ];

    await service.run({
      workspace,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: null,
      input: {
        agentUniversalIdentifier: 'agent-uid',
        messages,
      },
    });

    const executeAgentArgs =
      agentAsyncExecutorService.executeAgent.mock.calls[0][0];

    expect(executeAgentArgs.messages).toEqual(messages);
    expect(executeAgentArgs.baseSystemPrompt).toBe(
      AGENT_RUN_BASE_SYSTEM_PROMPT,
    );
    expect(executeAgentArgs.toolLoadingStrategy).toBe('lazy');
    expect(executeAgentArgs.authContext).toEqual({
      type: 'application',
      workspace,
      application: { id: 'app-1' },
    });
  });

  it('throws when neither prompt nor messages are provided', async () => {
    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        input: {
          agentUniversalIdentifier: 'agent-uid',
        },
      }),
    ).rejects.toThrow(/exactly one of prompt or messages/);

    expect(agentRepository.findOne).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('rejects running as a workspace member when the caller is not an application', async () => {
    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: 'user-workspace-1',
        requestWorkspaceMemberId: null,
        input: { ...input, runAsWorkspaceMemberId: 'workspace-member-1' },
      }),
    ).rejects.toThrow('requires an application access token');

    expect(
      agentActorContextService.buildRunAsWorkspaceMemberContext,
    ).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('rejects an application token issued for a user naming a different member', async () => {
    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: 'user-workspace-1',
        requestWorkspaceMemberId: 'workspace-member-2',
        callerApplication,
        input: { ...input, runAsWorkspaceMemberId: 'workspace-member-1' },
      }),
    ).rejects.toThrow('can only run an agent as that user');

    expect(
      agentActorContextService.buildRunAsWorkspaceMemberContext,
    ).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('rejects a user-bound application token whose member identity never resolved', async () => {
    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: 'user-workspace-1',
        requestWorkspaceMemberId: null,
        callerApplication,
        input: { ...input, runAsWorkspaceMemberId: 'workspace-member-1' },
      }),
    ).rejects.toThrow('can only run an agent as that user');

    expect(
      agentActorContextService.buildRunAsWorkspaceMemberContext,
    ).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('allows an application token with no user binding to name any member', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication,
      input: { ...input, runAsWorkspaceMemberId: 'someone-elses-member-id' },
    });

    expect(
      agentActorContextService.buildRunAsWorkspaceMemberContext,
    ).toHaveBeenCalledWith({
      workspaceMemberId: 'someone-elses-member-id',
      workspaceId: workspace.id,
    });
  });

  it('rejects running an agent that belongs to another application', async () => {
    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        callerApplication: { id: 'another-app' } as FlatApplication,
        input,
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
    });

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('allows an application to run its own agent', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication,
      input,
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalled();
  });

  it('allows an application token issued for a user to run as that same user', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: 'workspace-member-1',
      callerApplication,
      input: { ...input, runAsWorkspaceMemberId: 'workspace-member-1' },
    });

    expect(
      agentActorContextService.buildRunAsWorkspaceMemberContext,
    ).toHaveBeenCalledWith({
      workspaceMemberId: 'workspace-member-1',
      workspaceId: workspace.id,
    });
  });

  it('throws when both prompt and messages are provided', async () => {
    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        input: {
          agentUniversalIdentifier: 'agent-uid',
          prompt: 'Enrich record 123',
          messages: [{ role: 'user', content: 'Hello' }],
        },
      }),
    ).rejects.toThrow(/exactly one of prompt or messages/);

    expect(agentRepository.findOne).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('runs the agent with the programmatic base system prompt', async () => {
    await service.run({
      workspace,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      input,
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
        toolLoadingStrategy: 'lazy',
      }),
    );
  });

  it('returns an error result when the workspace ran out of credits', async () => {
    agentAsyncExecutorService.executeAgent.mockResolvedValue({
      result: { response: 'partial' },
      hasNoMoreAvailableCredits: true,
    });

    const result = await service.run({
      workspace,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: null,
      input,
    });

    expect(result).toEqual({
      result: null,
      error: 'AI agent stopped: no more available credits.',
      success: false,
    });
  });

  it('returns a generic error result when agent execution throws instead of bubbling GraphQL errors', async () => {
    agentAsyncExecutorService.executeAgent.mockRejectedValue(
      new Error('Failed to process successful response'),
    );

    const result = await service.run({
      workspace,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: null,
      input,
    });

    expect(result).toEqual({
      result: null,
      error: 'Agent execution failed.',
      success: false,
    });
  });

  it('throws when no agent matches the identifier', async () => {
    agentRepository.findOne.mockResolvedValue(null);

    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        input,
      }),
    ).rejects.toThrow(/not found/);

    expect(applicationService.findById).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it("throws when the agent's application cannot be found", async () => {
    applicationService.findById.mockResolvedValue(null);

    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        input,
      }),
    ).rejects.toThrow(/not found/);

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });
});
