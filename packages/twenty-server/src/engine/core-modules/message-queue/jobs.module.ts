import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { UpdateSubscriptionQuantityJob } from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { EmailSenderJob } from 'src/engine/core-modules/email/email-sender.job';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
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
import { WebhookJobModule } from 'src/modules/webhook/jobs/webhook-job.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, BillingSubscription], 'core'),
    DataSourceModule,
    ObjectMetadataModule,
    TypeORMModule,
    UserModule,
    UserVarsModule,
    EmailModule,
    DataSeedDemoWorkspaceModule,
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
  ],
  providers: [
    CleanSuspendedWorkspacesJob,
    CleanOnboardingWorkspacesJob,
    EmailSenderJob,
    UpdateSubscriptionQuantityJob,
    HandleWorkspaceMemberDeletedJob,
    CleanWorkspaceDeletionWarningUserVarsJob,
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
