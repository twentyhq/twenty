import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

import { TelemetryService } from './telemetry.service';

@Module({
  imports: [SecureHttpClientModule],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
