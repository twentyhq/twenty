import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationConnectionProviderResolver } from 'src/engine/core-modules/application/connection-provider/application-connection-provider.resolver';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { FlatConnectionProviderModule } from 'src/engine/metadata-modules/flat-connection-provider/flat-connection-provider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConnectionProviderEntity,
      ApplicationEntity,
      ApplicationRegistrationVariableEntity,
      ConnectedAccountEntity,
    ]),
    JwtModule,
    SecretEncryptionModule,
    SecureHttpClientModule,
    TwentyConfigModule,
    FlatConnectionProviderModule,
  ],
  providers: [
    ConnectionProviderService,
    ConnectionProviderOAuthFlowService,
    ApplicationConnectionProviderResolver,
  ],
  exports: [ConnectionProviderService, ConnectionProviderOAuthFlowService],
})
export class ConnectionProviderModule {}
