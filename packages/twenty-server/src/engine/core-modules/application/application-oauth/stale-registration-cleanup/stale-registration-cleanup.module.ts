import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { StaleRegistrationCleanupCronCommand } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/commands/stale-registration-cleanup.cron.command';
import { StaleRegistrationCleanupCronJob } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/crons/stale-registration-cleanup.cron.job';
import { StaleRegistrationCleanupService } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/services/stale-registration-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
  ],
  providers: [
    StaleRegistrationCleanupService,
    StaleRegistrationCleanupCronJob,
    StaleRegistrationCleanupCronCommand,
  ],
  exports: [StaleRegistrationCleanupCronCommand],
})
export class StaleRegistrationCleanupModule {}
