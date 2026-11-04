import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationRegistrationSeedingService } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationRegistrationLookupModule,
    CoreEntityCacheModule,
  ],
  providers: [ApplicationRegistrationSeedingService],
  exports: [ApplicationRegistrationSeedingService],
})
export class ApplicationRegistrationSeedingModule {}
