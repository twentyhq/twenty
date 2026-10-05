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
  let recordTurn: jest.Mock;
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
    recordTurn = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentTriggerRunnerService,
        {
          provide: AgentAsyncExecutorService,
          useValue: { executeAgent },
        },
        {
          provide: AgentRunConversationService,
          useValue: { recordTurn },
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
    expect(recordTurn).toHaveBeenCalled();
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
    expect(recordTurn).not.toHaveBeenCalled();
  });

  it('should not run when the agent role changed since dispatch', async () => {
    currentRoleId = 'other-role-id';

    await service.run(JOB_DATA);

    expect(executeAgent).not.toHaveBeenCalled();
  });

  it('should not fail the run when recording it fails', async () => {
    recordTurn.mockRejectedValue(new Error('history unavailable'));

    await expect(service.run(JOB_DATA)).resolves.toBeUndefined();
  });
});
