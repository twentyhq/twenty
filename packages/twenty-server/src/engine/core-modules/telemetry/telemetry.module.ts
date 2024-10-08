import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TelemetryService } from './telemetry.service';

@Module({
  providers: [TelemetryService],
  imports: [
    HttpModule.register({
      baseURL: 'https://t.twenty.com/api/v2',
    }),
  ],
  exports: [TelemetryService],
})
export class TelemetryModule {}
