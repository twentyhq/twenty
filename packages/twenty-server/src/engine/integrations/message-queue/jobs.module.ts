import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { DataSeedDemoWorkspaceJob } from 'src/database/commands/data-seed-demo-workspace/jobs/data-seed-demo-workspace.job';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { CallWebhookJobsJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook.job';
import { RecordPositionBackfillJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/record-position-backfill.job';
import { RecordPositionBackfillModule } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-module';
import { DeleteConnectedAccountAssociatedCalendarDataJob } from 'src/modules/calendar/jobs/delete-connected-account-associated-calendar-data.job';
import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.module';
import { MessageParticipantModule } from 'src/modules/messaging/services/message-participant/message-participant.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { CreateCompanyAndContactJob } from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { AuditLogObjectMetadata } from 'src/modules/timeline/standard-objects/audit-log.object-metadata';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UpdateSubscriptionJob } from 'src/engine/core-modules/billing/jobs/update-subscription.job';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { EmailSenderJob } from 'src/engine/integrations/email/email-sender.job';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CleanInactiveWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.job';
import { MatchParticipantJob } from 'src/modules/calendar-messaging-participant/jobs/match-participant.job';
import { UnmatchParticipantJob } from 'src/modules/calendar-messaging-participant/jobs/unmatch-participant.job';
import { GoogleCalendarSyncCronJob } from 'src/modules/calendar/crons/jobs/google-calendar-sync.cron.job';
import { CalendarCreateCompanyAndContactAfterSyncJob } from 'src/modules/calendar/jobs/calendar-create-company-and-contact-after-sync.job';
import { GoogleCalendarSyncJob } from 'src/modules/calendar/jobs/google-calendar-sync.job';
import { CalendarEventCleanerModule } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarEventParticipantModule } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.module';
import { GoogleCalendarSyncModule } from 'src/modules/calendar/services/google-calendar-sync/google-calendar-sync.module';
import { WorkspaceGoogleCalendarSyncModule } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.module';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { GmailFetchMessagesFromCacheCronJob } from 'src/modules/messaging/crons/jobs/gmail-fetch-messages-from-cache.cron.job';
import { GmailPartialSyncCronJob } from 'src/modules/messaging/crons/jobs/gmail-partial-sync.cron.job';
import { BlocklistReimportMessagesJob } from 'src/modules/messaging/jobs/blocklist-reimport-messages.job';
import { DeleteConnectedAccountAssociatedMessagingDataJob } from 'src/modules/messaging/jobs/delete-connected-account-associated-messaging-data.job';
import { BlocklistItemDeleteMessagesJob } from 'src/modules/messaging/jobs/blocklist-item-delete-messages.job';
import { GmailFullSyncJob } from 'src/modules/messaging/jobs/gmail-full-sync.job';
import { GmailPartialSyncJob } from 'src/modules/messaging/jobs/gmail-partial-sync.job';
import { MessagingCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/jobs/messaging-create-company-and-contact-after-sync.job';
import { GmailFetchMessageContentFromCacheModule } from 'src/modules/messaging/services/gmail-fetch-message-content-from-cache/gmail-fetch-message-content-from-cache.module';
import { CreateAuditLogFromInternalEvent } from 'src/modules/timeline/jobs/create-audit-log-from-internal-event';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { GmailFullSyncModule } from 'src/modules/messaging/services/gmail-full-sync/gmail-full-sync.module';
import { GmailPartialSyncModule } from 'src/modules/messaging/services/gmail-partial-sync/gmail-partial-sync.module';
import { ThreadCleanerModule } from 'src/modules/messaging/services/thread-cleaner/thread-cleaner.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { BlocklistItemDeleteCalendarEventsJob } from 'src/modules/calendar/jobs/blocklist-item-delete-calendar-events.job';

@Module({
  imports: [
    BillingModule,
    DataSourceModule,
    AutoCompaniesAndContactsCreationModule,
    DataSeedDemoWorkspaceModule,
    EnvironmentModule,
    HttpModule,
    GoogleCalendarSyncModule,
    WorkspaceGoogleCalendarSyncModule,
    ObjectMetadataModule,
    StripeModule,
    ThreadCleanerModule,
    CalendarEventCleanerModule,
    TypeORMModule,
    TypeOrmModule.forFeature([Workspace, FeatureFlagEntity], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
    UserModule,
    UserWorkspaceModule,
    WorkspaceDataSourceModule,
    RecordPositionBackfillModule,
    GoogleAPIRefreshAccessTokenModule,
    MessageParticipantModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      AuditLogObjectMetadata,
      MessageChannelMessageAssociationObjectMetadata,
    ]),
    GmailFullSyncModule,
    GmailFetchMessageContentFromCacheModule,
    GmailPartialSyncModule,
    CalendarEventParticipantModule,
    TimelineActivityModule,
  ],
  providers: [
    {
      provide: GoogleCalendarSyncJob.name,
      useClass: GoogleCalendarSyncJob,
    },
    {
      provide: CallWebhookJobsJob.name,
      useClass: CallWebhookJobsJob,
    },
    {
      provide: CallWebhookJob.name,
      useClass: CallWebhookJob,
    },
    {
      provide: CleanInactiveWorkspaceJob.name,
      useClass: CleanInactiveWorkspaceJob,
    },
    { provide: EmailSenderJob.name, useClass: EmailSenderJob },
    {
      provide: GmailPartialSyncCronJob.name,
      useClass: GmailPartialSyncCronJob,
    },
    {
      provide: MatchParticipantJob.name,
      useClass: MatchParticipantJob,
    },
    {
      provide: UnmatchParticipantJob.name,
      useClass: UnmatchParticipantJob,
    },
    {
      provide: MessagingCreateCompanyAndContactAfterSyncJob.name,
      useClass: MessagingCreateCompanyAndContactAfterSyncJob,
    },
    {
      provide: CalendarCreateCompanyAndContactAfterSyncJob.name,
      useClass: CalendarCreateCompanyAndContactAfterSyncJob,
    },
    {
      provide: DataSeedDemoWorkspaceJob.name,
      useClass: DataSeedDemoWorkspaceJob,
    },
    {
      provide: DeleteConnectedAccountAssociatedMessagingDataJob.name,
      useClass: DeleteConnectedAccountAssociatedMessagingDataJob,
    },
    {
      provide: DeleteConnectedAccountAssociatedCalendarDataJob.name,
      useClass: DeleteConnectedAccountAssociatedCalendarDataJob,
    },
    { provide: UpdateSubscriptionJob.name, useClass: UpdateSubscriptionJob },
    {
      provide: HandleWorkspaceMemberDeletedJob.name,
      useClass: HandleWorkspaceMemberDeletedJob,
    },
    {
      provide: RecordPositionBackfillJob.name,
      useClass: RecordPositionBackfillJob,
    },
    {
      provide: CreateCompanyAndContactJob.name,
      useClass: CreateCompanyAndContactJob,
    },

    {
      provide: CreateAuditLogFromInternalEvent.name,
      useClass: CreateAuditLogFromInternalEvent,
    },
    {
      provide: UpsertTimelineActivityFromInternalEvent.name,
      useClass: UpsertTimelineActivityFromInternalEvent,
    },
    {
      provide: GmailFetchMessagesFromCacheCronJob.name,
      useClass: GmailFetchMessagesFromCacheCronJob,
    },
    {
      provide: GmailFullSyncJob.name,
      useClass: GmailFullSyncJob,
    },
    {
      provide: GmailPartialSyncJob.name,
      useClass: GmailPartialSyncJob,
    },
    {
      provide: GoogleCalendarSyncCronJob.name,
      useClass: GoogleCalendarSyncCronJob,
    },
    {
      provide: BlocklistItemDeleteMessagesJob.name,
      useClass: BlocklistItemDeleteMessagesJob,
    },
    {
      provide: BlocklistItemDeleteCalendarEventsJob.name,
      useClass: BlocklistItemDeleteCalendarEventsJob,
    },
    {
      provide: BlocklistReimportMessagesJob.name,
      useClass: BlocklistReimportMessagesJob,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
