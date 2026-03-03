import { Module } from '@nestjs/common';

import { ApplicationSyncModule } from 'src/engine/core-modules/application/application-sync.module';
import { AppVersionCheckCronCommand } from 'src/engine/core-modules/application/crons/commands/app-version-check.cron.command';
import { AppVersionCheckCronJob } from 'src/engine/core-modules/application/crons/app-version-check.cron.job';

@Module({
  imports: [ApplicationSyncModule],
  providers: [AppVersionCheckCronJob, AppVersionCheckCronCommand],
  exports: [AppVersionCheckCronCommand],
})
export class AppVersionCheckModule {}
