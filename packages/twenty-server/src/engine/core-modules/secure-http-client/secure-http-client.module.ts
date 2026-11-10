import { Module } from '@nestjs/common';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';

import { SecureHttpClientService } from './secure-http-client.service';

@Module({
  imports: [MetricsModule],
  providers: [SecureHttpClientService],
  exports: [SecureHttpClientService],
})
export class SecureHttpClientModule {}
