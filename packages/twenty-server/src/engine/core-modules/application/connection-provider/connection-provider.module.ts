import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ApplicationConnectionProviderResolver } from 'src/engine/core-modules/application/connection-provider/application-connection-provider.resolver';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
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
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([
      ConnectionProviderEntity,
      ApplicationEntity,
      ApplicationRegistrationVariableEntity,
      ConnectedAccountEntity,
      UserEntity,
    ]),
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
    AppConnectionAccessService,
    ConnectionProviderService,
    ConnectionProviderOAuthFlowService,
    ConnectionProviderLifecycleHookService,
    ApplicationConnectionProviderResolver,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [
    ConnectionProviderService,
    ConnectionProviderOAuthFlowService,
    ConnectionProviderLifecycleHookService,
  ],
})
export class ConnectionProviderModule {}
