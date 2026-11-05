import { Module } from '@nestjs/common';

import { ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

@Module({
  imports: [SecureHttpClientModule],
  providers: [ClientIdMetadataDocumentService],
  exports: [ClientIdMetadataDocumentService],
})
export class ClientIdMetadataDocumentModule {}
