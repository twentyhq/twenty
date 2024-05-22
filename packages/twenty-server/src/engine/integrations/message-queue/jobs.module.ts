import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { DataSeedDemoWorkspaceJob } from 'src/database/commands/data-seed-demo-workspace/jobs/data-seed-demo-workspace.job';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceQueryRunnerJobModule } from 'src/engine/api/graphql/workspace-query-runner/jobs/workspace-query-runner-job.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UpdateSubscriptionJob } from 'src/engine/core-modules/billing/jobs/update-subscription.job';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { EmailSenderJob } from 'src/engine/integrations/email/email-sender.job';
import { EmailModule } from 'src/engine/integrations/email/email.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { CleanInactiveWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.job';
import { CalendarEventParticipantModule } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.module';
import { GmailMessagesImportModule } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import.module';
import { GmailFullMessageListFetchModule } from 'src/modules/messaging/services/gmail-full-message-list-fetch/gmail-full-message-list-fetch.module';
import { GmailPartialMessageListFetchModule } from 'src/modules/messaging/services/gmail-partial-message-list-fetch/gmail-partial-message-list-fetch.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { CalendarMessagingParticipantJobModule } from 'src/modules/calendar-messaging-participant/jobs/calendar-messaging-participant-job.module';
import { CalendarCronJobModule } from 'src/modules/calendar/crons/jobs/calendar-cron-job.module';
import { CalendarJobModule } from 'src/modules/calendar/jobs/calendar-job.module';
import { AutoCompaniesAndContactsCreationJobModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/auto-companies-and-contacts-creation-job.module';
import { MessagingCronJobModule } from 'src/modules/messaging/crons/jobs/messaging-cron-job.module';
import { MessagingJobModule } from 'src/modules/messaging/jobs/messaging-job.module';
import { TimelineJobModule } from 'src/modules/timeline/jobs/timeline-job.module';

@Module({
  imports: [
    DataSourceModule,
    ObjectMetadataModule,
    TypeORMModule,
    UserModule,
    EmailModule,
    DataSeedDemoWorkspaceModule,
    BillingModule,
    UserWorkspaceModule,
    WorkspaceModule,
    GmailFullMessageListFetchModule,
    GmailMessagesImportModule,
    GmailPartialMessageListFetchModule,
    CalendarEventParticipantModule,
    TimelineActivityModule,
    StripeModule,
    // JobsModules
    WorkspaceQueryRunnerJobModule,
    CalendarMessagingParticipantJobModule,
    CalendarCronJobModule,
    CalendarJobModule,
    AutoCompaniesAndContactsCreationJobModule,
    MessagingCronJobModule,
    MessagingJobModule,
    TimelineJobModule,
  ],
  providers: [
    {
      provide: CleanInactiveWorkspaceJob.name,
      useClass: CleanInactiveWorkspaceJob,
    },
    { provide: EmailSenderJob.name, useClass: EmailSenderJob },
    {
      provide: DataSeedDemoWorkspaceJob.name,
      useClass: DataSeedDemoWorkspaceJob,
    },
    { provide: UpdateSubscriptionJob.name, useClass: UpdateSubscriptionJob },
    {
      provide: HandleWorkspaceMemberDeletedJob.name,
      useClass: HandleWorkspaceMemberDeletedJob,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
