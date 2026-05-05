import { Module } from '@nestjs/common';

import { ApplicationOAuthProviderModule } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.module';
import { AppOAuthRefreshAccessTokenService } from 'src/engine/core-modules/application/application-oauth-provider/refresh/services/app-oauth-refresh-tokens.service';
import { AppOAuthRevokeService } from 'src/engine/core-modules/application/application-oauth-provider/refresh/services/app-oauth-revoke.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

@Module({
  imports: [
    ApplicationOAuthProviderModule,
    ApplicationVariableEntityModule,
    SecureHttpClientModule,
  ],
  providers: [AppOAuthRefreshAccessTokenService, AppOAuthRevokeService],
  exports: [AppOAuthRefreshAccessTokenService, AppOAuthRevokeService],
})
export class AppOAuthRefreshModule {}
