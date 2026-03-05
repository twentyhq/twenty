import { Module } from '@nestjs/common';

import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { AppVersionCheckCronCommand } from 'src/engine/core-modules/application/application-version-check/crons/commands/app-version-check.cron.command';
import { AppVersionCheckCronJob } from 'src/engine/core-modules/application/application-version-check/crons/app-version-check.cron.job';

@Module({
  imports: [ApplicationInstallModule],
  providers: [AppVersionCheckCronJob, AppVersionCheckCronCommand],
  exports: [AppVersionCheckCronCommand],
})
export class AppVersionCheckModule {}
