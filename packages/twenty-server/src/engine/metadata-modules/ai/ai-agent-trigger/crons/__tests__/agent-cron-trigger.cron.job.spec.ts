import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type AgentTrigger } from 'twenty-shared/application';

import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentCronTriggerCronJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/crons/agent-cron-trigger.cron.job';
import { RunAgentTriggerJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/run-agent-trigger.job';
import { AgentTriggerThrottlerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-throttler.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const AGENT_ID = 'agent-id';
const TRIGGER_ID = '0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22';

const buildCronTrigger = (isActive = true): AgentTrigger => ({
  id: TRIGGER_ID,
  type: 'CRON',
  isActive,
  instructions: 'Send the weekly digest',
  settings: { pattern: '0 9 * * 1' },
});

const buildFlatAgentMaps = (triggers: AgentTrigger[]) =>
  addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: {
      id: AGENT_ID,
      universalIdentifier: AGENT_ID,
      workspaceId: WORKSPACE_ID,
      triggers,
      deletedAt: null,
    } as never,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

describe('AgentCronTriggerCronJob', () => {
  let job: AgentCronTriggerCronJob;
  let messageQueueService: { add: jest.Mock };
  let cronTriggerDeduplicationService: { shouldDispatch: jest.Mock };
  let agentTriggerThrottlerService: { tryConsumeRuns: jest.Mock };
  let flatAgentMaps: ReturnType<typeof buildFlatAgentMaps>;

  beforeEach(async () => {
    flatAgentMaps = buildFlatAgentMaps([buildCronTrigger()]);
    messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    cronTriggerDeduplicationService = {
      shouldDispatch: jest.fn().mockResolvedValue(true),
    };
    agentTriggerThrottlerService = {
      tryConsumeRuns: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentCronTriggerCronJob,
        {
          provide: getQueueToken(MessageQueue.aiQueue),
          useValue: messageQueueService,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([{ id: WORKSPACE_ID }]),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest
              .fn()
              .mockImplementation(async () => ({ flatAgentMaps })),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: { captureExceptions: jest.fn() },
        },
        {
          provide: CronTriggerDeduplicationService,
          useValue: cronTriggerDeduplicationService,
        },
        {
          provide: AgentTriggerThrottlerService,
          useValue: agentTriggerThrottlerService,
        },
      ],
    }).compile();

    job = module.get(AgentCronTriggerCronJob);
  });

  it('should enqueue a run for a due cron trigger', async () => {
    await job.handle();

    expect(cronTriggerDeduplicationService.shouldDispatch).toHaveBeenCalledWith(
      `agent-cron:${WORKSPACE_ID}:${AGENT_ID}:${TRIGGER_ID}`,
      '0 9 * * 1',
      expect.any(Date),
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      RunAgentTriggerJob.name,
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        agentId: AGENT_ID,
        triggerId: TRIGGER_ID,
        payload: { type: 'CRON', firedAt: expect.any(String) },
      }),
    );
  });

  it('should not enqueue a run for a trigger that is not due', async () => {
    cronTriggerDeduplicationService.shouldDispatch.mockResolvedValue(false);

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should ignore inactive cron triggers', async () => {
    flatAgentMaps = buildFlatAgentMaps([buildCronTrigger(false)]);

    await job.handle();

    expect(
      cronTriggerDeduplicationService.shouldDispatch,
    ).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should not enqueue a run once the agent reached its run limit', async () => {
    agentTriggerThrottlerService.tryConsumeRuns.mockResolvedValue(false);

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
