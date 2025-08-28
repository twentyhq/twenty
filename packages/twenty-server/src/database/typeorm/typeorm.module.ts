import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeORMCoreModuleOptions } from 'src/database/typeorm/core/core.datasource';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMCoreModuleOptions)],
  providers: [],
  exports: [],
})
export class TypeORMModule {}
