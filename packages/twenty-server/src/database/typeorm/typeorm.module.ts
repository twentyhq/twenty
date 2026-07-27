import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource, type DataSourceOptions } from 'typeorm';

import { typeORMCoreModuleOptions } from 'src/database/typeorm/core/core.datasource';
import { DatabaseGaugeService } from 'src/database/typeorm/database-gauge.service';
import { DatabasePoolMetricsService } from 'src/database/typeorm/database-pool-metrics.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { installUpgradeAwareRepositoryProxy } from 'src/engine/twenty-orm/upgrade-aware/install-upgrade-aware-repository-proxy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => typeORMCoreModuleOptions,
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options as DataSourceOptions);

        await dataSource.initialize();
        installUpgradeAwareRepositoryProxy(dataSource);

        return dataSource;
      },
    }),
    MetricsModule,
  ],
  providers: [DatabasePoolMetricsService, DatabaseGaugeService],
  exports: [DatabasePoolMetricsService],
})
export class TypeORMModule {}
