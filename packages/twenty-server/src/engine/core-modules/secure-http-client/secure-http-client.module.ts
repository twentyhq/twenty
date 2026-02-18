import { Module } from '@nestjs/common';

import { SecureHttpClientService } from './secure-http-client.service';

@Module({
  providers: [SecureHttpClientService],
  exports: [SecureHttpClientService],
})
export class SecureHttpClientModule {}
