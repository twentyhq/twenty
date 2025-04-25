import { DynamicModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigValueConverterService } from 'src/engine/core-modules/twenty-config/conversion/config-value-converter.service';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';

@Module({})
export class DatabaseConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseConfigModule,
      imports: [
        TypeOrmModule.forFeature([KeyValuePair], 'core'),
        ScheduleModule.forRoot(),
      ],
      providers: [
        DatabaseConfigDriver,
        ConfigCacheService,
        ConfigStorageService,
        ConfigValueConverterService,
        {
          provide: ConfigVariables,
          useValue: new ConfigVariables(),
        },
      ],
      exports: [DatabaseConfigDriver],
    };
  }
}
