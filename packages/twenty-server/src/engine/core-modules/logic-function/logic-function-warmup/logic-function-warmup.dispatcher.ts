import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import {
  LogicFunctionWarmupJob,
  type LogicFunctionWarmupJobData,
} from 'src/engine/core-modules/logic-function/logic-function-warmup/logic-function-warmup.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const WORKSPACES_PER_WARMUP_JOB = 20;

// Layer caches start cold after every deploy: without a warmup the first
// executions all pay the full build at once and can stampede the build lock
// and saturate the S3 connection pool. Enqueues warmup jobs covering every
// active workspace so layers are built ahead of first use.
@Injectable()
export class LogicFunctionWarmupDispatcher implements OnApplicationBootstrap {
  private readonly logger = new Logger(LogicFunctionWarmupDispatcher.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  onApplicationBootstrap(): void {
    // Fire-and-forget: dispatching must never block or fail startup (with the
    // sync queue driver, enqueueing executes the warmup inline).
    void this.dispatchWarmupJobs();
  }

  private async dispatchWarmupJobs(): Promise<void> {
    let workspaceIdBatches: string[][];

    try {
      const activeWorkspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
        select: ['id'],
      });

      workspaceIdBatches = chunk(
        activeWorkspaces.map((activeWorkspace) => activeWorkspace.id),
        WORKSPACES_PER_WARMUP_JOB,
      );
    } catch (error) {
      this.logger.error(
        `Failed to dispatch logic function layer warmup: ${error}`,
      );

      return;
    }

    let dispatchedWorkspaceCount = 0;
    let dispatchedJobCount = 0;

    for (const [batchIndex, workspaceIds] of workspaceIdBatches.entries()) {
      try {
        await this.messageQueueService.add<LogicFunctionWarmupJobData>(
          LogicFunctionWarmupJob.name,
          { workspaceIds },
          {
            // BullMQ rejects custom job ids containing ':'
            id: `logic-function-warmup-batch-${batchIndex}`,
            retryLimit: 2,
          },
        );
        dispatchedWorkspaceCount += workspaceIds.length;
        dispatchedJobCount++;
      } catch (error) {
        this.logger.error(
          `Failed to enqueue logic function layer warmup batch ${batchIndex}: ${error}`,
        );
      }
    }

    this.logger.log(
      `Dispatched logic function layer warmup for ${dispatchedWorkspaceCount} workspace(s) in ${dispatchedJobCount} job(s)`,
    );
  }
}
