import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarEventListFetchCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-event-list-fetch.cron.job';
import { CalendarEventsImportCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-events-import.cron.job';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';
import { MessagingMessageListFetchCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';
import { MessagingMessagesImportCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-messages-import.cron.job';
import { MessagingOngoingStaleCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';
import { CronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/cron-trigger.cron.job';

@Command({
  name: 'cron:remove:all',
  description: 'Remove all background sync cron jobs',
})
export class CronRemoveAllCommand extends CommandRunner {
  private readonly logger = new Logger(CronRemoveAllCommand.name);

  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Removing all background sync cron jobs...');

      await this.messageQueueService.removeCron({
        jobName: MessagingMessagesImportCronJob.name,
      });
      await this.messageQueueService.removeCron({
        jobName: MessagingMessageListFetchCronJob.name,
      });
      await this.messageQueueService.removeCron({
        jobName: MessagingOngoingStaleCronJob.name,
      });
      await this.messageQueueService.removeCron({
        jobName: CalendarEventListFetchCronJob.name,
      });
      await this.messageQueueService.removeCron({
        jobName: CalendarEventsImportCronJob.name,
      });
      await this.messageQueueService.removeCron({
        jobName: CalendarOngoingStaleCronJob.name,
      });
      await this.messageQueueService.removeCron({
        jobName: CronTriggerCronJob.name,
      });

      this.logger.log('Successfully removed all background sync cron jobs');
    } catch (error) {
      this.logger.error('Failed to remove cron jobs:', error);
      throw error;
    }
  }
}
