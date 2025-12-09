import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { CheckPublicDomainsValidRecordsCronCommand } from 'src/engine/core-modules/public-domain/crons/commands/check-public-domains-valid-records.cron.command';
import { CheckCustomDomainValidRecordsCronCommand } from 'src/engine/core-modules/workspace/crons/commands/check-custom-domain-valid-records.cron.command';
import { CronTriggerCronCommand } from 'src/engine/metadata-modules/cron-trigger/crons/commands/cron-trigger.cron.command';
import { TrashCleanupCronCommand } from 'src/engine/trash-cleanup/commands/trash-cleanup.cron.command';
import { CleanOnboardingWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-onboarding-workspaces.cron.command';
import { CleanSuspendedWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-suspended-workspaces.cron.command';
import { CalendarEventListFetchCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-event-list-fetch.cron.command';
import { CalendarEventsImportCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-import.cron.command';
import { CalendarOngoingStaleCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-ongoing-stale.cron.command';
import { CalendarRelaunchFailedCalendarChannelsCronCommand } from 'src/modules/calendar/calendar-event-import-manager/crons/commands/calendar-relaunch-failed-calendar-channels.cron.command';
import { MessagingMessageListFetchCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-message-list-fetch.cron.command';
import { MessagingMessagesImportCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-messages-import.cron.command';
import { MessagingOngoingStaleCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-ongoing-stale.cron.command';
import { MessagingRelaunchFailedMessageChannelsCronCommand } from 'src/modules/messaging/message-import-manager/crons/commands/messaging-relaunch-failed-message-channels.cron.command';
import { WorkflowCleanWorkflowRunsCronCommand } from 'src/modules/workflow/workflow-runner/workflow-run-queue/cron/command/workflow-clean-workflow-runs.cron.command';
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
    private readonly messagingRelaunchFailedMessageChannelsCronCommand: MessagingRelaunchFailedMessageChannelsCronCommand,

    private readonly calendarEventListFetchCronCommand: CalendarEventListFetchCronCommand,
    private readonly calendarEventsImportCronCommand: CalendarEventsImportCronCommand,
    private readonly calendarOngoingStaleCronCommand: CalendarOngoingStaleCronCommand,
    private readonly calendarRelaunchFailedCalendarChannelsCronCommand: CalendarRelaunchFailedCalendarChannelsCronCommand,

    private readonly workflowCronTriggerCronCommand: WorkflowCronTriggerCronCommand,
    private readonly workflowRunEnqueueCronCommand: WorkflowRunEnqueueCronCommand,
    private readonly workflowHandleStaledRunsCronCommand: WorkflowHandleStaledRunsCronCommand,
    private readonly workflowCleanWorkflowRunsCronCommand: WorkflowCleanWorkflowRunsCronCommand,

    private readonly checkCustomDomainValidRecordsCronCommand: CheckCustomDomainValidRecordsCronCommand,
    private readonly checkPublicDomainsValidRecordsCronCommand: CheckPublicDomainsValidRecordsCronCommand,
    private readonly cronTriggerCronCommand: CronTriggerCronCommand,
    private readonly cleanSuspendedWorkspacesCronCommand: CleanSuspendedWorkspacesCronCommand,
    private readonly cleanOnboardingWorkspacesCronCommand: CleanOnboardingWorkspacesCronCommand,
    private readonly trashCleanupCronCommand: TrashCleanupCronCommand,
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
        name: 'MessagingRelaunchFailedMessageChannels',
        command: this.messagingRelaunchFailedMessageChannelsCronCommand,
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
        name: 'CalendarRelaunchFailedCalendarChannels',
        command: this.calendarRelaunchFailedCalendarChannelsCronCommand,
      },
      {
        name: 'CheckCustomDomainValidRecords',
        command: this.checkCustomDomainValidRecordsCronCommand,
      },
      {
        name: 'CheckPublicDomainsValidRecords',
        command: this.checkPublicDomainsValidRecordsCronCommand,
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
      {
        name: 'CronTrigger',
        command: this.cronTriggerCronCommand,
      },
      {
        name: 'CleanSuspendedWorkspaces',
        command: this.cleanSuspendedWorkspacesCronCommand,
      },
      {
        name: 'CleanOnboardingWorkspaces',
        command: this.cleanOnboardingWorkspacesCronCommand,
      },
      {
        name: 'TrashCleanup',
        command: this.trashCleanupCronCommand,
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
