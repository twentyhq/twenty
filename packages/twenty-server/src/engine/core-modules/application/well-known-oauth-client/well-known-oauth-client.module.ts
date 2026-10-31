import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationRegistrationLookupModule,
    CoreEntityCacheModule,
  ],
  providers: [WellKnownOAuthClientRegistrationService],
  exports: [WellKnownOAuthClientRegistrationService],
})
export class WellKnownOAuthClientModule {}
