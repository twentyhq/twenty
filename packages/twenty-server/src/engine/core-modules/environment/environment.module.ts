import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseDriver } from 'src/engine/core-modules/environment/drivers/database.driver';
import { EnvironmentDriver } from 'src/engine/core-modules/environment/drivers/environment.driver';
import { validate } from 'src/engine/core-modules/environment/environment-variables';
import { ConfigurableModuleClass } from 'src/engine/core-modules/environment/environment.module-definition';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

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
  providers: [EnvironmentService, EnvironmentDriver, DatabaseDriver],
  exports: [EnvironmentService, EnvironmentDriver, DatabaseDriver],
})
export class EnvironmentModule extends ConfigurableModuleClass {}
