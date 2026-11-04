import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationSeedingModule } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WellKnownOAuthClientInstallService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-install.service';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
    ApplicationRegistrationSeedingModule,
    FeatureFlagModule,
  ],
  providers: [
    WellKnownOAuthClientInstallService,
    WellKnownOAuthClientRegistrationService,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [
    WellKnownOAuthClientInstallService,
    WellKnownOAuthClientRegistrationService,
  ],
})
export class WellKnownOAuthClientModule {}
