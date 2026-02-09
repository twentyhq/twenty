import { Module } from '@nestjs/common';

import { SecureHttpClientService } from 'src/engine/core-modules/tool/services/secure-http-client.service';

import { TelemetryService } from './telemetry.service';

@Module({
  providers: [TelemetryService, SecureHttpClientService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
