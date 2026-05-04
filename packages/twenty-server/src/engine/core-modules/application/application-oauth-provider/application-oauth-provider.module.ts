import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationConnectionProviderResolver } from 'src/engine/core-modules/application/application-oauth-provider/application-connection-provider.resolver';
import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderFlowService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-flow.service';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
// FlatConnectionProviderModule registers the workspace-cache provider that
// the SyncableEntity sync pipeline reads from when the manifest sync runs;
// importing it here keeps the cache discoverable wherever this module ends
// up in the app graph.
import { FlatConnectionProviderModule } from 'src/engine/metadata-modules/flat-connection-provider/flat-connection-provider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationOAuthProviderEntity,
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
    ApplicationOAuthProviderService,
    ApplicationOAuthProviderFlowService,
    ApplicationConnectionProviderResolver,
  ],
  exports: [
    ApplicationOAuthProviderService,
    ApplicationOAuthProviderFlowService,
  ],
})
export class ApplicationOAuthProviderModule {}
