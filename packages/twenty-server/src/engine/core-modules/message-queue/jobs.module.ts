import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AuditJobModule } from 'src/engine/core-modules/audit/jobs/audit-job.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { UpdateSubscriptionQuantityJob } from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { EmailSenderJob } from 'src/engine/core-modules/email/email-sender.job';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UpdateWorkspaceMemberEmailJob } from 'src/engine/core-modules/user/jobs/update-workspace-member-email.job';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WebhookJobModule } from 'src/engine/core-modules/webhook/jobs/webhook-job.module';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { AiAgentMonitorModule } from 'src/engine/metadata-modules/ai/ai-agent-monitor/ai-agent-monitor.module';
import { CronTriggerModule } from 'src/engine/metadata-modules/cron-trigger/cron-trigger.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { DatabaseEventTriggerModule } from 'src/engine/metadata-modules/database-event-trigger/database-event-trigger.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { CleanOnboardingWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-onboarding-workspaces.job';
import { CleanSuspendedWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-suspended-workspaces.job';
import { CleanWorkspaceDeletionWarningUserVarsJob } from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';
import { WorkspaceCleanerModule } from 'src/engine/workspace-manager/workspace-cleaner/workspace-cleaner.module';
import { CalendarEventParticipantManagerModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant-manager.module';
import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { AutoCompaniesAndContactsCreationJobModule } from 'src/modules/contact-creation-manager/jobs/auto-companies-and-contacts-creation-job.module';
import { FavoriteModule } from 'src/modules/favorite/favorite.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { TimelineJobModule } from 'src/modules/timeline/jobs/timeline-job.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, BillingSubscriptionEntity]),
    DataSourceModule,
    ObjectMetadataModule,
    TypeORMModule,
    UserModule,
    UserVarsModule,
    EmailModule,
    BillingModule,
    UserWorkspaceModule,
    WorkspaceModule,
    AuthModule,
    MessagingModule,
    CalendarModule,
    CalendarEventParticipantManagerModule,
    TimelineActivityModule,
    StripeModule,
    AutoCompaniesAndContactsCreationJobModule,
    TimelineJobModule,
    WebhookJobModule,
    WorkflowModule,
    FavoriteModule,
    WorkspaceCleanerModule,
    SubscriptionsModule,
    AuditJobModule,
    AiAgentMonitorModule,
    CronTriggerModule,
    DatabaseEventTriggerModule,
    ServerlessFunctionModule,
  ],
  providers: [
    CleanSuspendedWorkspacesJob,
    CleanOnboardingWorkspacesJob,
    EmailSenderJob,
    UpdateSubscriptionQuantityJob,
    HandleWorkspaceMemberDeletedJob,
    CleanWorkspaceDeletionWarningUserVarsJob,
    UpdateWorkspaceMemberEmailJob,
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
