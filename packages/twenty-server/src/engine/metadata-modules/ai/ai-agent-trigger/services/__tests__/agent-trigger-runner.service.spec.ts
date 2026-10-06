import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
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
  let runAgent: jest.Mock;
  let currentRoleId: string | undefined;
  let findAgent: jest.Mock;
  let findApplication: jest.Mock;

  beforeEach(async () => {
    currentRoleId = AGENT_ROLE_ID;
    findAgent = jest.fn().mockResolvedValue(buildAgent());
    findApplication = jest
      .fn()
      .mockResolvedValue({ id: 'application-id', name: 'App' });
    runAgent = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentTriggerRunnerService,
        {
          provide: AgentRunnerService,
          useValue: { run: runAgent },
        },
        {
          provide: AgentRunCallerHandlerRegistryService,
          useValue: { register: jest.fn() },
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

  it('should run the agent as itself in a new conversation, able to wait', async () => {
    await service.run(JOB_DATA);

    expect(runAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation: { threadId: expect.any(String), isCreated: true },
        caller: {
          type: 'AGENT_TRIGGER',
          ref: {
            agentId: AGENT_ID,
            triggerId: TRIGGER_ID,
            dispatchedRoleId: AGENT_ROLE_ID,
          },
        },
        spec: expect.objectContaining({
          title: 'Enricher',
          toolLoadingStrategy: 'lazy',
          capabilities: {
            canAskHumans: false,
            canProposeToolCalls: false,
          },
        }),
        prompt: expect.objectContaining({
          senderUserWorkspaceId: null,
          senderApplicationId: 'application-id',
        }),
        executionContext: expect.objectContaining({
          actorContext: expect.objectContaining({ name: 'Enricher' }),
          authContext: expect.objectContaining({
            type: 'application',
            actingAgent: { id: AGENT_ID, label: 'Enricher' },
          }),
          rolePermissionConfig: { intersectionOf: [AGENT_ROLE_ID] },
        }),
      }),
    );
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

    expect(runAgent).not.toHaveBeenCalled();
  });

  it('should not run when the agent role changed since dispatch', async () => {
    currentRoleId = 'other-role-id';

    await service.run(JOB_DATA);

    expect(runAgent).not.toHaveBeenCalled();
  });
});
