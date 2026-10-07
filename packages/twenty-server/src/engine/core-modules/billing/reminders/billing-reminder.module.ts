import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingReminderCronCommand } from 'src/engine/core-modules/billing/reminders/crons/commands/billing-reminder.cron.command';
import { BillingReminderService } from 'src/engine/core-modules/billing/reminders/services/billing-reminder.service';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingSubscriptionEntity, WorkspaceEntity]),
    UserModule,
    UserVarsModule,
    WorkspaceDomainsModule,
  ],
  providers: [BillingReminderService, BillingReminderCronCommand],
  exports: [BillingReminderService, BillingReminderCronCommand],
})
export class BillingReminderModule {}
