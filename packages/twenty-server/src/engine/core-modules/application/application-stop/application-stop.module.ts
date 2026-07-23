import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { StopApplicationCommand } from 'src/engine/core-modules/application/application-stop/commands/stop-application.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
  ],
  providers: [ApplicationStopService, StopApplicationCommand],
  exports: [ApplicationStopService],
})
export class ApplicationStopModule {}
