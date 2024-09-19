import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { DataSeedDemoWorkspaceJob } from 'src/database/commands/data-seed-demo-workspace/jobs/data-seed-demo-workspace.job';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceQueryRunnerJobModule } from 'src/engine/api/graphql/workspace-query-runner/jobs/workspace-query-runner-job.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UpdateSubscriptionJob } from 'src/engine/core-modules/billing/jobs/update-subscription.job';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { EmailSenderJob } from 'src/engine/core-modules/email/email-sender.job';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { CleanInactiveWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.job';
import { CalendarEventParticipantManagerModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant-manager.module';
import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { AutoCompaniesAndContactsCreationJobModule } from 'src/modules/contact-creation-manager/jobs/auto-companies-and-contacts-creation-job.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { TimelineJobModule } from 'src/modules/timeline/jobs/timeline-job.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    DataSourceModule,
    ObjectMetadataModule,
    TypeORMModule,
    UserModule,
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
    WorkspaceQueryRunnerJobModule,
    AutoCompaniesAndContactsCreationJobModule,
    TimelineJobModule,
    WorkflowModule,
  ],
  providers: [
    CleanInactiveWorkspaceJob,
    EmailSenderJob,
    DataSeedDemoWorkspaceJob,
    UpdateSubscriptionJob,
    HandleWorkspaceMemberDeletedJob,
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
