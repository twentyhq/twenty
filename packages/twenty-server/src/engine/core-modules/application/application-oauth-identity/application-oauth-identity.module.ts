import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationOAuthIdentitiesCacheProviderService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identities-cache-provider.service';
import { ApplicationOAuthIdentityInstallService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity-install.service';
import { ApplicationOAuthIdentityService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
    ]),
    CoreEntityCacheModule,
    FeatureFlagModule,
  ],
  providers: [
    ApplicationOAuthIdentitiesCacheProviderService,
    ApplicationOAuthIdentityService,
    ApplicationOAuthIdentityInstallService,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [
    ApplicationOAuthIdentityService,
    ApplicationOAuthIdentityInstallService,
  ],
})
export class ApplicationOAuthIdentityModule {}
