import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientIdMetadataDocumentModule } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/client-id-metadata-document.module';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client-registration-resolver.service';
import { OAuthClientResolver } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client.resolver';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationRegistrationModule,
    ApplicationRegistrationLookupModule,
    ClientIdMetadataDocumentModule,
    ThrottlerModule,
  ],
  providers: [OAuthClientRegistrationResolverService, OAuthClientResolver],
  exports: [OAuthClientRegistrationResolverService],
})
export class OAuthClientRegistrationModule {}
