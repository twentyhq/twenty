import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import {
  LogicFunctionWarmupJob,
  LogicFunctionWarmupJobData,
} from 'src/engine/core-modules/logic-function/logic-function-warmup/logic-function-warmup.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class LogicFunctionWarmupDispatcher implements OnApplicationBootstrap {
  private readonly logger = new Logger(LogicFunctionWarmupDispatcher.name);

  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      if (
        this.twentyConfigService.get('LOGIC_FUNCTION_TYPE') ===
        LogicFunctionDriverType.DISABLED
      ) {
        return;
      }

      const activeWorkspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
        select: ['id'],
      });

      for (const activeWorkspace of activeWorkspaces) {
        await this.messageQueueService.add<LogicFunctionWarmupJobData>(
          LogicFunctionWarmupJob.name,
          { workspaceId: activeWorkspace.id },
          {
            id: `logic-function-warmup:${activeWorkspace.id}`,
            retryLimit: 2,
          },
        );
      }

      this.logger.log(
        `Dispatched logic function layer warmup for ${activeWorkspaces.length} workspaces`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to dispatch logic function layer warmup: ${error}`,
      );
    }
  }
}
