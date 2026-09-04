import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { UpdateSubscriptionQuantityJob } from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { ApplicationRecurringChargeModule } from 'src/engine/core-modules/billing/app-billing/application-recurring-charge.module';
import { ApplicationRecurringChargeCronJob } from 'src/engine/core-modules/billing/app-billing/crons/jobs/application-recurring-charge.cron.job';
import { BillingReminderModule } from 'src/engine/core-modules/billing/reminders/billing-reminder.module';
import { BillingReminderCronJob } from 'src/engine/core-modules/billing/reminders/crons/billing-reminder.cron.job';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { ApplicationLifecycleReconciliationModule } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/application-lifecycle-reconciliation.module';
import { ApplicationLifecycleReconciliationCronJob } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/crons/application-lifecycle-reconciliation.cron.job';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationUpgradeModule } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.module';
import { InstallApplicationsJob } from 'src/engine/core-modules/application/jobs/install-applications.job';
import { UninstallApplicationJob } from 'src/engine/core-modules/application/jobs/uninstall-application.job';
import { UpgradeApplicationJob } from 'src/engine/core-modules/application/jobs/upgrade-application.job';
import { UpgradeApplicationsJob } from 'src/engine/core-modules/application/jobs/upgrade-applications.job';
import { InstallOnboardingAppsJob } from 'src/engine/core-modules/onboarding/jobs/install-onboarding-apps.job';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { EmailSenderJob } from 'src/engine/core-modules/email/email-sender.job';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';
import { MaterializeCampaignChunkJob } from 'src/modules/emailing/jobs/materialize-campaign-chunk.job';
import { MaterializeCampaignJob } from 'src/modules/emailing/jobs/materialize-campaign.job';
import { ReconcileWorkspaceCampaignStatsJob } from 'src/modules/emailing/jobs/reconcile-workspace-campaign-stats.job';
import { RefreshCampaignStatsJob } from 'src/modules/emailing/jobs/refresh-campaign-stats.job';
import { SendCampaignEmailJob } from 'src/modules/emailing/jobs/send-campaign-email.job';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { EventLogIngestionModule } from 'src/engine/core-modules/event-logs/ingest/event-log-ingestion.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GenerateSdkClientJob } from 'src/engine/core-modules/sdk-client/jobs/generate-sdk-client.job';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UpdateWorkspaceMemberEmailJob } from 'src/engine/core-modules/user/jobs/update-workspace-member-email.job';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { WorkspaceDeletionApplicationUninstallJob } from 'src/engine/core-modules/workspace/jobs/workspace-deletion-application-uninstall.job';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { AiAgentMonitorModule } from 'src/engine/metadata-modules/ai/ai-agent-monitor/ai-agent-monitor.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WebhookJobModule } from 'src/engine/metadata-modules/webhook/jobs/webhook-job.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { CleanOnboardingWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-onboarding-workspaces.job';
import { CleanSuspendedWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-suspended-workspaces.job';
import { CleanWorkspaceDeletionWarningUserVarsJob } from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';
import { WorkspaceCleanerModule } from 'src/engine/workspace-manager/workspace-cleaner/workspace-cleaner.module';
import { CalendarEventParticipantManagerModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant-manager.module';
import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { AutoCompaniesAndContactsCreationJobModule } from 'src/modules/contact-creation-manager/jobs/auto-companies-and-contacts-creation-job.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { TimelineJobModule } from 'src/modules/timeline/jobs/timeline-job.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      BillingSubscriptionEntity,
      BillingSubscriptionItemEntity,
      BillingProductEntity,
    ]),
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
    FeatureFlagModule,
    AutoCompaniesAndContactsCreationJobModule,
    TimelineJobModule,
    WebhookJobModule,
    WorkflowModule,
    NavigationMenuItemModule,
    SdkClientModule,
    WorkspaceCleanerModule,
    SubscriptionsModule,
    EventLogIngestionModule,
    AiAgentMonitorModule,
    AiChatModule,
    LogicFunctionModule,
    EnterpriseModule,
    EmailingModule,
    ApplicationInstallModule,
    ApplicationLifecycleReconciliationModule,
    ApplicationManifestModule,
    ApplicationRegistrationModule,
    ApplicationUpgradeModule,
    OnboardingModule,
    BillingReminderModule,
    ApplicationRecurringChargeModule,
  ],
  providers: [
    ApplicationRecurringChargeCronJob,
    ApplicationLifecycleReconciliationCronJob,
    BillingReminderCronJob,
    CleanSuspendedWorkspacesJob,
    CleanOnboardingWorkspacesJob,
    EmailSenderJob,
    SendCampaignEmailJob,
    MaterializeCampaignJob,
    MaterializeCampaignChunkJob,
    RefreshCampaignStatsJob,
    ReconcileWorkspaceCampaignStatsJob,
    UpdateSubscriptionQuantityJob,
    HandleWorkspaceMemberDeletedJob,
    WorkspaceDeletionApplicationUninstallJob,
    CleanWorkspaceDeletionWarningUserVarsJob,
    UpdateWorkspaceMemberEmailJob,
    GenerateSdkClientJob,
    UpgradeApplicationsJob,
    InstallApplicationsJob,
    UpgradeApplicationJob,
    UninstallApplicationJob,
    InstallOnboardingAppsJob,
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
