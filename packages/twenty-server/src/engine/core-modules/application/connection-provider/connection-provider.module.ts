import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ApplicationConnectionProviderResolver } from 'src/engine/core-modules/application/connection-provider/application-connection-provider.resolver';
import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderFlowCookieService } from 'src/engine/core-modules/application/connection-provider/connection-provider-flow-cookie.service';
import { ConnectionProviderCustomFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-custom-flow.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-client/connection-provider-oauth-client.service';
import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderOAuthClientEntity } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/entities/connection-provider-oauth-client.entity';
import { ConnectionProviderDiscoveredOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-discovered-oauth-client.service';
import { DiscoveredOAuthClientDriver } from 'src/engine/core-modules/application/connection-provider/oauth-client/drivers/discovered-oauth-client.driver';
import { ManifestOAuthClientDriver } from 'src/engine/core-modules/application/connection-provider/oauth-client/drivers/manifest-oauth-client.driver';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { FlatConnectionProviderModule } from 'src/engine/metadata-modules/flat-connection-provider/flat-connection-provider.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([
      ConnectionProviderEntity,
      ConnectionProviderOAuthClientEntity,
      ApplicationEntity,
      ApplicationRegistrationVariableEntity,
      ConnectedAccountEntity,
      UserEntity,
    ]),
    CacheLockModule,
    JwtModule,
    SecretEncryptionModule,
    SecureHttpClientModule,
    FlatConnectionProviderModule,
    ConnectedAccountTokenEncryptionModule,
    WorkspaceCacheModule,
    PermissionsModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(ConnectionProviderEntity),
    provideWorkspaceScopedRepository(ConnectionProviderOAuthClientEntity),
    ConnectionProviderDiscoveredOAuthClientService,
    DiscoveredOAuthClientDriver,
    ManifestOAuthClientDriver,
    ConnectionProviderOAuthClientService,
    AppConnectionAccessService,
    ConnectionProviderService,
    ConnectionProviderAuthorizationStateService,
    ConnectionProviderConnectedAccountService,
    ConnectionProviderOAuthFlowService,
    ConnectionProviderCustomFlowService,
    ConnectionProviderFlowCookieService,
    ConnectionProviderLifecycleHookService,
    ApplicationConnectionProviderResolver,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [
    ConnectionProviderService,
    ConnectionProviderOAuthClientService,
    ConnectionProviderAuthorizationStateService,
    ConnectionProviderOAuthFlowService,
    ConnectionProviderCustomFlowService,
    ConnectionProviderFlowCookieService,
    ConnectionProviderLifecycleHookService,
  ],
})
export class ConnectionProviderModule {}
