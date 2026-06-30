import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { ApplicationVersionCheckCronJob } from 'src/engine/core-modules/application/application-upgrade/crons/application-version-check.cron.job';
import { ApplicationVersionCheckCronCommand } from 'src/engine/core-modules/application/application-upgrade/crons/commands/application-version-check.cron.command';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationUpgradeResolver } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.resolver';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
    ApplicationInstallModule,
    FeatureFlagModule,
    PermissionsModule,
    TwentyConfigModule,
  ],
  providers: [
    ApplicationUpgradeService,
    ApplicationUpgradeResolver,
    ApplicationVersionCheckCronJob,
    ApplicationVersionCheckCronCommand,
  ],
  exports: [ApplicationUpgradeService, ApplicationVersionCheckCronCommand],
})
export class ApplicationUpgradeModule {}
