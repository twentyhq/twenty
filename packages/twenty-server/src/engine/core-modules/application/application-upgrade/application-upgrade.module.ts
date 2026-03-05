import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { ApplicationVersionCheckCronJob } from 'src/engine/core-modules/application/application-upgrade/crons/application-version-check.cron.job';
import { ApplicationVersionCheckCronCommand } from 'src/engine/core-modules/application/application-upgrade/crons/commands/application-version-check.cron.command';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
    ApplicationInstallModule,
    TwentyConfigModule,
  ],
  providers: [
    ApplicationUpgradeService,
    ApplicationVersionCheckCronJob,
    ApplicationVersionCheckCronCommand,
  ],
  exports: [ApplicationUpgradeService, ApplicationVersionCheckCronCommand],
})
export class ApplicationUpgradeModule {}
