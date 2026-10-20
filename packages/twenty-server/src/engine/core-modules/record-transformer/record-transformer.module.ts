import { Module } from '@nestjs/common';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';

import { RecordInputTransformerService } from './services/record-input-transformer.service';

@Module({
  imports: [MetricsModule],
  providers: [RecordInputTransformerService],
  exports: [RecordInputTransformerService],
})
export class RecordTransformerModule {}
