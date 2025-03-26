import { Module } from '@nestjs/common';

import { ClickhouseService } from './clickhouse.service';

@Module({
  providers: [ClickhouseService],
  exports: [ClickhouseService],
})
export class ClickhouseModule {}
