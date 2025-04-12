import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { validate } from 'src/engine/core-modules/twenty-config/config-variables';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { ConfigurableModuleClass } from 'src/engine/core-modules/twenty-config/twenty-config.module-definition';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
  ],
  providers: [
    TwentyConfigService,
    EnvironmentConfigDriver,
    DatabaseConfigDriver,
    ConfigCacheService,
    ConfigStorageService,
  ],
  exports: [TwentyConfigService],
})
export class TwentyConfigModule extends ConfigurableModuleClass {}
