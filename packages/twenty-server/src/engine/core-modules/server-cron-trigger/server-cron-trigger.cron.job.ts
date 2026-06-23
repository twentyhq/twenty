import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const SERVER_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class ServerCronTriggerCronJob {
  private readonly logger = new Logger(ServerCronTriggerCronJob.name);

  constructor(
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(ServerCronTriggerCronJob.name)
  @SentryCronMonitor(
    ServerCronTriggerCronJob.name,
    SERVER_CRON_TRIGGER_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    if (!this.twentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED')) {
      return;
    }

    const now = new Date();

    // Only the owner-workspace copy of each server-exposed function is
    // eligible: `lf.workspaceId = reg."workspaceId"` (the owner workspace).
    const serverCrons = await this.logicFunctionRepository
      .createQueryBuilder('lf')
      .innerJoin('core.application', 'app', 'app.id = lf."applicationId"')
      .innerJoin(
        'core.applicationRegistration',
        'reg',
        'reg.id = app."applicationRegistrationId"',
      )
      .where('lf."serverCronTriggerSettings" IS NOT NULL')
      .andWhere('lf."deletedAt" IS NULL')
      .andWhere('lf."workspaceId" = reg."workspaceId"')
      .andWhere('reg."deletedAt" IS NULL')
      .andWhere('reg."workspaceId" IS NOT NULL')
      .getMany();

    for (const logicFunction of serverCrons) {
      const pattern = logicFunction.serverCronTriggerSettings?.pattern;

      if (!isDefined(pattern) || !shouldRunNow(pattern, now)) {
        continue;
      }

      try {
        await this.messageQueueService.add<LogicFunctionTriggerJobData[]>(
          LogicFunctionTriggerJob.name,
          [
            {
              logicFunctionId: logicFunction.id,
              workspaceId: logicFunction.workspaceId,
              payload: { source: 'server-cron' },
            },
          ],
          { retryLimit: 3 },
        );
      } catch (error) {
        this.logger.error(
          `Failed to enqueue server cron for function ${logicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
