import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationRegistrationEntity])],
  providers: [ApplicationRegistrationLookupService],
  exports: [ApplicationRegistrationLookupService],
})
export class ApplicationRegistrationLookupModule {}
