import { Module } from '@nestjs/common';

import { RecordInputTransformerService } from './services/record-input-transformer.service';

@Module({
  providers: [RecordInputTransformerService],
  exports: [RecordInputTransformerService],
})
export class RecordTransformerModule {}
