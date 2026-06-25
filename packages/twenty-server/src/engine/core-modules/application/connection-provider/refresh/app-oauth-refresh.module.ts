import { Module } from '@nestjs/common';

import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

@Module({
  imports: [
    ConnectionProviderModule,
    ApplicationVariableEntityModule,
    SecureHttpClientModule,
    ConnectedAccountTokenEncryptionModule,
  ],
  providers: [AppOAuthRefreshAccessTokenService, AppOAuthRevokeService],
  exports: [AppOAuthRefreshAccessTokenService, AppOAuthRevokeService],
})
export class AppOAuthRefreshModule {}
