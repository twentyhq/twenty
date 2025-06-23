import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { CalendarEventListFetchCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-event-list-fetch.cron.command';
import { CalendarEventsImportCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-import.cron.command';
import { CalendarOngoingStaleCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-ongoing-stale.cron.command';
import { MessagingMessageListFetchCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-message-list-fetch.cron.command';
import { MessagingMessagesImportCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-messages-import.cron.command';
import { MessagingOngoingStaleCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-ongoing-stale.cron.command';
import { CronTriggerCronCommand } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/cron-trigger.cron.command';

@Command({
  name: 'cron:register:all',
  description: 'Register all background sync cron jobs',
})
export class CronRegisterAllCommand extends CommandRunner {
  private readonly logger = new Logger(CronRegisterAllCommand.name);

  constructor(
    private readonly messagingMessagesImportCronCommand: MessagingMessagesImportCronCommand,
    private readonly messagingMessageListFetchCronCommand: MessagingMessageListFetchCronCommand,
    private readonly messagingOngoingStaleCronCommand: MessagingOngoingStaleCronCommand,
    private readonly calendarEventListFetchCronCommand: CalendarEventListFetchCronCommand,
    private readonly calendarEventsImportCronCommand: CalendarEventsImportCronCommand,
    private readonly calendarOngoingStaleCronCommand: CalendarOngoingStaleCronCommand,
    private readonly cronTriggerCronCommand: CronTriggerCronCommand,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Registering all background sync cron jobs...');

      await this.messagingMessagesImportCronCommand.run();
      await this.messagingMessageListFetchCronCommand.run();
      await this.messagingOngoingStaleCronCommand.run();
      await this.calendarEventListFetchCronCommand.run();
      await this.calendarEventsImportCronCommand.run();
      await this.calendarOngoingStaleCronCommand.run();
      await this.cronTriggerCronCommand.run();

      this.logger.log('Successfully registered all background sync cron jobs');
    } catch (error) {
      this.logger.error('Failed to register cron jobs:', error);
      throw error;
    }
  }
}
