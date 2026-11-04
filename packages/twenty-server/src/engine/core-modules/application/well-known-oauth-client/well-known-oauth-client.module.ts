import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationSeedingModule } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationRegistrationSeedingModule,
  ],
  providers: [WellKnownOAuthClientRegistrationService],
  exports: [WellKnownOAuthClientRegistrationService],
})
export class WellKnownOAuthClientModule {}
