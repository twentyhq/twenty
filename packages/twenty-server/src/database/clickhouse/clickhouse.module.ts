import { Module } from '@nestjs/common';

import { ClickHouseService } from './clickhouse.service';

@Module({
  providers: [ClickHouseService],
  exports: [ClickHouseService],
})
export class ClickHouseModule {}
