import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/oauth-client-registration-resolver.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { WellKnownOAuthClientModule } from 'src/engine/core-modules/application/well-known-oauth-client/well-known-oauth-client.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    SecureHttpClientModule,
    WellKnownOAuthClientModule,
  ],
  providers: [
    ClientIdMetadataDocumentService,
    OAuthClientRegistrationResolverService,
  ],
  exports: [OAuthClientRegistrationResolverService],
})
export class ClientIdMetadataDocumentModule {}
