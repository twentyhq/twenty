import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderFlowService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-flow.service';
import { ApplicationOAuthProviderResolver } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.resolver';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationOAuthProviderEntity,
      ConnectedAccountEntity,
    ]),
    ApplicationVariableEntityModule,
    JwtModule,
    SecureHttpClientModule,
    TwentyConfigModule,
  ],
  providers: [
    ApplicationOAuthProviderService,
    ApplicationOAuthProviderFlowService,
    ApplicationOAuthProviderResolver,
  ],
  exports: [
    ApplicationOAuthProviderService,
    ApplicationOAuthProviderFlowService,
  ],
})
export class ApplicationOAuthProviderModule {}
