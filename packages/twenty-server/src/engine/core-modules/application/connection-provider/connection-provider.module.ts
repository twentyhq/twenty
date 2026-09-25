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
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { FlatConnectionProviderModule } from 'src/engine/metadata-modules/flat-connection-provider/flat-connection-provider.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([
      ConnectionProviderEntity,
      ApplicationEntity,
      ApplicationRegistrationVariableEntity,
      ConnectedAccountEntity,
      UserEntity,
    ]),
    JwtModule,
    LogicFunctionExecutorModule,
    SecretEncryptionModule,
    SecureHttpClientModule,
    TwentyConfigModule,
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
