import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { ApplicationKillSwitchCommand } from 'src/engine/core-modules/application/application-stop/commands/application-kill-switch.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
  ],
  providers: [ApplicationStopService, ApplicationKillSwitchCommand],
  exports: [ApplicationStopService],
})
export class ApplicationStopModule {}
