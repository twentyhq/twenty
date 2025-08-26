import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeORMCoreModuleOptions } from 'src/database/typeorm/core/core.datasource';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

import { TypeORMService } from './typeorm.service';

@Module({
  imports: [
    TwentyConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...typeORMCoreModuleOptions,
      }),
    }),
  ],
  providers: [TypeORMService],
  exports: [TypeORMService],
})
export class TypeORMModule {}
