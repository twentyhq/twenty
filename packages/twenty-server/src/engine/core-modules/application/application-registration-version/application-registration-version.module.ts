import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationRegistrationVersionEntity])],
  providers: [ApplicationRegistrationVersionService],
  exports: [ApplicationRegistrationVersionService],
})
export class ApplicationRegistrationVersionModule {}
