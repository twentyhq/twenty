import { Test, type TestingModule } from '@nestjs/testing';

import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AGENT_RUN_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-run-base-system-prompt.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('AgentRunService', () => {
  let service: AgentRunService;
  let agentRepository: { findOne: jest.Mock };
  let applicationService: { findById: jest.Mock };
  let agentAsyncExecutorService: { executeAgent: jest.Mock };

  const workspace = { id: 'workspace-1' } as FlatWorkspace;

  const agent = { id: 'agent-1', applicationId: 'app-1' } as AgentEntity;

  const input = {
    agentUniversalIdentifier: 'agent-uid',
    prompt: 'Enrich record 123',
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentRunService,
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
      input,
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        userPrompt: input.prompt,
        authContext: {
          type: 'application',
          workspace,
          application: { id: 'app-1' },
        },
      }),
    );
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
      input: {
        agentUniversalIdentifier: 'agent-uid',
        messages,
      },
    });

    const executeAgentArgs =
      agentAsyncExecutorService.executeAgent.mock.calls[0][0];

    expect(executeAgentArgs.messages).toEqual(messages);
    expect(executeAgentArgs.userPrompt).toBeUndefined();
    expect(executeAgentArgs.baseSystemPrompt).toBe(
      AGENT_RUN_BASE_SYSTEM_PROMPT,
    );
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
        input: {
          agentUniversalIdentifier: 'agent-uid',
        },
      }),
    ).rejects.toThrow(/exactly one of prompt or messages/);

    expect(agentRepository.findOne).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('throws when both prompt and messages are provided', async () => {
    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
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
      input,
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        baseSystemPrompt: AGENT_RUN_BASE_SYSTEM_PROMPT,
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
      input,
    });

    expect(result).toEqual({
      result: null,
      error: 'AI agent stopped: no more available credits.',
      success: false,
    });
  });

  it('throws when no agent matches the identifier', async () => {
    agentRepository.findOne.mockResolvedValue(null);

    await expect(
      service.run({
        workspace,
        requestUserWorkspaceId: null,
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
        input,
      }),
    ).rejects.toThrow(/not found/);

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });
});
