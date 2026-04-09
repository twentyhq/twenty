import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeORMCoreModuleOptions } from 'src/database/typeorm/core/core.datasource';
import { DatabaseGaugeService } from 'src/database/typeorm/database-gauge.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMCoreModuleOptions), MetricsModule],
  providers: [DatabaseGaugeService],
  exports: [],
})
export class TypeORMModule {}
