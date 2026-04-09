import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarEventListFetchCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-event-list-fetch.cron.job';

const CALENDAR_EVENTS_LIST_CRON_PATTERN = '*/5 * * * *';

@Command({
  name: 'cron:calendar:calendar-event-list-fetch',
  description: 'Starts a cron job to fetch the calendar event list',
})
export class CalendarEventListFetchCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CalendarEventListFetchCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: CALENDAR_EVENTS_LIST_CRON_PATTERN,
        },
      },
    });
  }
}
