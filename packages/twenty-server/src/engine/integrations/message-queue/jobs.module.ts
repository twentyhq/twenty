import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CallWebhookJobsJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook.job';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { CleanInactiveWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.job';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { EmailSenderJob } from 'src/engine/integrations/email/email-sender.job';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { GmailPartialSyncCronJob } from 'src/modules/messaging/jobs/crons/gmail-partial-sync.cron.job';
import { MatchMessageParticipantJob } from 'src/modules/messaging/jobs/match-message-participant.job';
import { CreateCompaniesAndContactsAfterSyncJob } from 'src/modules/messaging/jobs/create-companies-and-contacts-after-sync.job';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { DataSeedDemoWorkspaceJob } from 'src/database/commands/data-seed-demo-workspace/jobs/data-seed-demo-workspace.job';
import { DeleteConnectedAccountAssociatedMessagingDataJob } from 'src/modules/messaging/jobs/delete-connected-account-associated-messaging-data.job';
import { ThreadCleanerModule } from 'src/modules/messaging/services/thread-cleaner/thread-cleaner.module';
import { UpdateSubscriptionJob } from 'src/engine/core-modules/billing/jobs/update-subscription.job';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { GoogleCalendarFullSyncJob } from 'src/modules/calendar/jobs/google-calendar-full-sync.job';
import { CalendarEventCleanerModule } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { RecordPositionBackfillJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/record-position-backfill.job';
import { RecordPositionBackfillModule } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-module';
import { DeleteConnectedAccountAssociatedCalendarDataJob } from 'src/modules/calendar/jobs/delete-connected-account-associated-calendar-data.job';
import { GoogleCalendarFullSyncModule } from 'src/modules/calendar/services/google-calendar-full-sync.module';
import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.module';
import { MessageParticipantModule } from 'src/modules/messaging/services/message-participant/message-participant.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { SaveEventToDbJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/save-event-to-db.job';
import { CreateCompanyAndContactJob } from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { EventObjectMetadata } from 'src/modules/event/standard-objects/event.object-metadata';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { GmailFullSynV2Module } from 'src/modules/messaging/services/gmail-full-sync-v2/gmail-full-sync.v2.module';
import { GmailFetchMessageContentFromCacheModule } from 'src/modules/messaging/services/gmail-fetch-message-content-from-cache/gmail-fetch-message-content-from-cache.module';
import { FetchAllMessagesFromCacheCronJob } from 'src/modules/messaging/jobs/crons/fetch-all-messages-from-cache.cron.job';
import { GmailFullSyncV2Job } from 'src/modules/messaging/jobs/gmail-full-sync-v2.job';
import { GmailPartialSyncV2Job } from 'src/modules/messaging/jobs/gmail-partial-sync-v2.job';
import { GmailPartialSyncV2Module } from 'src/modules/messaging/services/gmail-partial-sync-v2/gmail-partial-sync-v2.module';

@Module({
  imports: [
    BillingModule,
    DataSourceModule,
    AutoCompaniesAndContactsCreationModule,
    DataSeedDemoWorkspaceModule,
    EnvironmentModule,
    HttpModule,
    GoogleCalendarFullSyncModule,
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
      MessageParticipantObjectMetadata,
      MessageChannelObjectMetadata,
      EventObjectMetadata,
    ]),
    GmailFullSynV2Module,
    GmailFetchMessageContentFromCacheModule,
    GmailPartialSyncV2Module,
  ],
  providers: [
    {
      provide: GoogleCalendarFullSyncJob.name,
      useClass: GoogleCalendarFullSyncJob,
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
      provide: MatchMessageParticipantJob.name,
      useClass: MatchMessageParticipantJob,
    },
    {
      provide: CreateCompaniesAndContactsAfterSyncJob.name,
      useClass: CreateCompaniesAndContactsAfterSyncJob,
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
      provide: SaveEventToDbJob.name,
      useClass: SaveEventToDbJob,
    },
    {
      provide: FetchAllMessagesFromCacheCronJob.name,
      useClass: FetchAllMessagesFromCacheCronJob,
    },
    {
      provide: GmailFullSyncV2Job.name,
      useClass: GmailFullSyncV2Job,
    },
    {
      provide: GmailPartialSyncV2Job.name,
      useClass: GmailPartialSyncV2Job,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
