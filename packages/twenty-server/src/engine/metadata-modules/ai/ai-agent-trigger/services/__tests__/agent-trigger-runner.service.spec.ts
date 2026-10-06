import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentTriggerRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-runner.service';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const AGENT_ID = 'agent-id';
const AGENT_ROLE_ID = 'agent-role-id';
const TRIGGER_ID = '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11';

const JOB_DATA: RunAgentTriggerJobData = {
  workspaceId: WORKSPACE_ID,
  agentId: AGENT_ID,
  triggerId: TRIGGER_ID,
  dispatchedRoleId: AGENT_ROLE_ID,
  payload: {
    type: 'DATABASE_EVENT',
    eventName: 'company.created',
    objectNameSingular: 'company',
    events: [],
  },
};

const buildAgent = (isTriggerActive = true) => ({
  id: AGENT_ID,
  label: 'Enricher',
  applicationId: 'application-id',
  triggers: [
    {
      id: TRIGGER_ID,
      type: 'DATABASE_EVENT',
      isActive: isTriggerActive,
      instructions: 'Qualify the company',
      settings: { eventName: 'company.created' },
    },
  ],
});

describe('AgentTriggerRunnerService', () => {
  let service: AgentTriggerRunnerService;
  let executeAgent: jest.Mock;
  let openTurn: jest.Mock;
  let closeTurn: jest.Mock;
  let failTurn: jest.Mock;
  let currentRoleId: string | undefined;
  let findAgent: jest.Mock;
  let findApplication: jest.Mock;

  beforeEach(async () => {
    currentRoleId = AGENT_ROLE_ID;
    findAgent = jest.fn().mockResolvedValue(buildAgent());
    findApplication = jest
      .fn()
      .mockResolvedValue({ id: 'application-id', name: 'App' });
    executeAgent = jest.fn().mockResolvedValue({ result: { text: 'done' } });
    openTurn = jest.fn().mockResolvedValue('turn-id');
    closeTurn = jest.fn().mockResolvedValue(undefined);
    failTurn = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentTriggerRunnerService,
        {
          provide: AgentAsyncExecutorService,
          useValue: { executeAgent },
        },
        {
          provide: AgentRunConversationService,
          useValue: { openTurn, closeTurn, failTurn },
        },
        {
          provide: ApplicationLookupService,
          useValue: { findById: findApplication },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(AgentEntity),
          useValue: { findOne: findAgent },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue({
              id: WORKSPACE_ID,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            }),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockImplementation(async () => ({
              flatRoleTargetByAgentIdMaps: {
                [AGENT_ID]: { agentId: AGENT_ID, roleId: currentRoleId },
              },
            })),
          },
        },
      ],
    }).compile();

    service = module.get(AgentTriggerRunnerService);
  });

  it('should run the agent and record the run', async () => {
    await service.run(JOB_DATA);

    expect(executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        authContext: expect.objectContaining({
          type: 'application',
          actingAgent: { id: AGENT_ID, label: 'Enricher' },
        }),
        toolLoadingStrategy: 'lazy',
      }),
    );
    expect(openTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: AGENT_ID,
        createdBy: expect.objectContaining({ name: 'Enricher' }),
      }),
    );
    expect(closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({ turnId: 'turn-id' }),
    );
  });

  it('should record a failed run when the agent throws', async () => {
    const error = new Error('model unavailable');

    executeAgent.mockRejectedValue(error);

    await expect(service.run(JOB_DATA)).rejects.toThrow('model unavailable');

    expect(failTurn).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      turnId: 'turn-id',
      error,
    });
    expect(closeTurn).not.toHaveBeenCalled();
  });

  it.each([
    ['the agent was deleted', () => findAgent.mockResolvedValue(null)],
    [
      'the trigger was turned off',
      () => findAgent.mockResolvedValue(buildAgent(false)),
    ],
    [
      'the trigger was removed',
      () => findAgent.mockResolvedValue({ ...buildAgent(), triggers: [] }),
    ],
    [
      'the application was not found',
      () => findApplication.mockResolvedValue(null),
    ],
  ])('should not run when %s', async (_, arrange) => {
    arrange();

    await service.run(JOB_DATA);

    expect(executeAgent).not.toHaveBeenCalled();
    expect(openTurn).not.toHaveBeenCalled();
  });

  it('should not run when the agent role changed since dispatch', async () => {
    currentRoleId = 'other-role-id';

    await service.run(JOB_DATA);

    expect(executeAgent).not.toHaveBeenCalled();
  });

  it('should still run the agent when the run cannot be recorded', async () => {
    openTurn.mockRejectedValue(new Error('history unavailable'));

    await expect(service.run(JOB_DATA)).resolves.toBeUndefined();

    expect(executeAgent).toHaveBeenCalled();
    expect(closeTurn).not.toHaveBeenCalled();
  });

  it('should not fail the run when closing its record fails', async () => {
    closeTurn.mockRejectedValue(new Error('history unavailable'));

    await expect(service.run(JOB_DATA)).resolves.toBeUndefined();
  });
});
