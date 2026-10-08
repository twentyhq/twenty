import { Module } from '@nestjs/common';

import { RecordPositionService } from './services/record-position.service';

@Module({
  imports: [],
  providers: [RecordPositionService],
  exports: [RecordPositionService],
})
export class RecordPositionModule {}
