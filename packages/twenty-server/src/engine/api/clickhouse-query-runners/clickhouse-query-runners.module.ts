import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';

import { ClickHouseFindManyQueryRunnerService } from './services/clickhouse-find-many-query-runner.service';
import { ClickHouseFindOneQueryRunnerService } from './services/clickhouse-find-one-query-runner.service';
import { ClickHouseGroupByQueryRunnerService } from './services/clickhouse-group-by-query-runner.service';

@Module({
  imports: [ClickHouseModule],
  providers: [
    ClickHouseFindManyQueryRunnerService,
    ClickHouseFindOneQueryRunnerService,
    ClickHouseGroupByQueryRunnerService,
  ],
  exports: [
    ClickHouseFindManyQueryRunnerService,
    ClickHouseFindOneQueryRunnerService,
    ClickHouseGroupByQueryRunnerService,
  ],
})
export class ClickHouseQueryRunnersModule {}
