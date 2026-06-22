import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  ServerLogicFunctionExecutionJob,
  type ServerLogicFunctionExecutionJobData,
} from 'src/engine/core-modules/server-logic-function-executor/cron/server-logic-function-execution.job';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const SERVER_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class ServerCronTriggerCronJob {
  private readonly logger = new Logger(ServerCronTriggerCronJob.name);

  constructor(
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly repository: Repository<ApplicationRegistrationLogicFunctionEntity>,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(ServerCronTriggerCronJob.name)
  @SentryCronMonitor(
    ServerCronTriggerCronJob.name,
    SERVER_CRON_TRIGGER_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const now = new Date();

    const serverCrons = await this.repository
      .createQueryBuilder('serverLogicFunction')
      .innerJoinAndSelect(
        'serverLogicFunction.applicationRegistration',
        'applicationRegistration',
      )
      .where('serverLogicFunction."serverCronTriggerSettings" IS NOT NULL')
      .andWhere('serverLogicFunction."disabledAt" IS NULL')
      .andWhere('serverLogicFunction."deletedAt" IS NULL')
      .andWhere('applicationRegistration."workspaceId" IS NOT NULL')
      .getMany();

    for (const serverCron of serverCrons) {
      const pattern = serverCron.serverCronTriggerSettings?.pattern;
      const registration = serverCron.applicationRegistration;
      const ownerWorkspaceId = registration?.ownerWorkspaceId;

      if (
        !isDefined(pattern) ||
        !isDefined(ownerWorkspaceId) ||
        !shouldRunNow(pattern, now)
      ) {
        continue;
      }

      try {
        await this.messageQueueService.add<ServerLogicFunctionExecutionJobData>(
          ServerLogicFunctionExecutionJob.name,
          {
            applicationRegistrationUniversalIdentifier:
              registration.universalIdentifier,
            logicFunctionUniversalIdentifier: serverCron.universalIdentifier,
          },
          { retryLimit: 3 },
        );
      } catch (error) {
        this.logger.error(
          `Failed to enqueue server cron for function ${serverCron.id}: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
