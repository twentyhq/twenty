import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ProxyDatabaseService } from 'src/engine/core-modules/postgres-credentials/proxy-database/proxy-database.service';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [DataSourceModule, EnvironmentModule, TypeORMModule],
  providers: [ProxyDatabaseService],
  exports: [ProxyDatabaseService],
})
export class ProxyDatabaseModule {}
