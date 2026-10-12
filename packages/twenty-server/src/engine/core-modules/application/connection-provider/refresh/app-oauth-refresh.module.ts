import { Module } from '@nestjs/common';

import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-refresh-tokens.service';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

@Module({
  imports: [
    ConnectionProviderModule,
    SecureHttpClientModule,
    ConnectedAccountTokenEncryptionModule,
  ],
  providers: [AppOAuthRefreshAccessTokenService],
  exports: [AppOAuthRefreshAccessTokenService],
})
export class AppOAuthRefreshModule {}
