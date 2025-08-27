import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { CheckCustomDomainValidRecordsCronCommand } from 'src/engine/core-modules/domain-manager/crons/commands/check-custom-domain-valid-records.cron.command';
import { CleanupOrphanedFilesCronCommand } from 'src/engine/core-modules/file/crons/commands/cleanup-orphaned-files.cron.command';
import { CalendarEventListFetchCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-event-list-fetch.cron.command';
import { CalendarEventsImportCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-import.cron.command';
import { CalendarOngoingStaleCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-ongoing-stale.cron.command';
import { MessagingMessageListFetchCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-message-list-fetch.cron.command';
import { MessagingMessagesImportCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-messages-import.cron.command';
import { MessagingOngoingStaleCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-ongoing-stale.cron.command';
import { WorkflowCleanWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-clean-workflow-runs.cron.command';
import { WorkflowHandleStaledRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-handle-staled-runs.cron.command';
import { WorkflowRunEnqueueCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-run-enqueue.cron.command';
import { WorkflowCronTriggerCronCommand } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/workflow-cron-trigger.cron.command';

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
    private readonly workflowCronTriggerCronCommand: WorkflowCronTriggerCronCommand,
    private readonly cleanupOrphanedFilesCronCommand: CleanupOrphanedFilesCronCommand,
    private readonly checkCustomDomainValidRecordsCronCommand: CheckCustomDomainValidRecordsCronCommand,
    private readonly workflowRunEnqueueCronCommand: WorkflowRunEnqueueCronCommand,
    private readonly workflowHandleStaledRunsCronCommand: WorkflowHandleStaledRunsCronCommand,
    private readonly workflowCleanWorkflowRunsCronCommand: WorkflowCleanWorkflowRunsCommand,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Registering all background sync cron jobs...');

    const commands = [
      {
        name: 'MessagingMessagesImport',
        command: this.messagingMessagesImportCronCommand,
      },
      {
        name: 'MessagingMessageListFetch',
        command: this.messagingMessageListFetchCronCommand,
      },
      {
        name: 'MessagingOngoingStale',
        command: this.messagingOngoingStaleCronCommand,
      },
      {
        name: 'CalendarEventListFetch',
        command: this.calendarEventListFetchCronCommand,
      },
      {
        name: 'CalendarEventsImport',
        command: this.calendarEventsImportCronCommand,
      },
      {
        name: 'CalendarOngoingStale',
        command: this.calendarOngoingStaleCronCommand,
      },
      {
        name: 'CleanupOrphanedFiles',
        command: this.cleanupOrphanedFilesCronCommand,
      },
      {
        name: 'CheckCustomDomainValidRecords',
        command: this.checkCustomDomainValidRecordsCronCommand,
      },
      {
        name: 'WorkflowCronTrigger',
        command: this.workflowCronTriggerCronCommand,
      },
      {
        name: 'WorkflowRunEnqueue',
        command: this.workflowRunEnqueueCronCommand,
      },
      {
        name: 'WorkflowHandleStaledRuns',
        command: this.workflowHandleStaledRunsCronCommand,
      },
      {
        name: 'WorkflowCleanWorkflowRuns',
        command: this.workflowCleanWorkflowRunsCronCommand,
      },
    ];

    let successCount = 0;
    let failureCount = 0;
    const failures: string[] = [];
    const successes: string[] = [];

    for (const { name, command } of commands) {
      try {
        this.logger.log(`Registering ${name} cron job...`);
        await command.run();
        this.logger.log(`Successfully registered ${name} cron job`);
        successCount++;
        successes.push(name);
      } catch (error) {
        this.logger.error(`Failed to register ${name} cron job:`, error);
        failureCount++;
        failures.push(name);
      }
    }

    this.logger.log(
      `Cron job registration completed: ${successCount} successful, ${failureCount} failed`,
    );

    if (failures.length > 0) {
      this.logger.warn(`Failed commands: ${failures.join(', ')}`);
    }

    if (successCount > 0) {
      this.logger.log(`Successful commands: ${successes.join(', ')}`);
    }
  }
}
