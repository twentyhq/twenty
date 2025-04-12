import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { typeORMCoreModuleOptions } from 'src/database/typeorm/core/core.datasource';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

import { TypeORMService } from './typeorm.service';

import { typeORMMetadataModuleOptions } from './metadata/metadata.datasource';

const metadataTypeORMFactory = async (): Promise<TypeOrmModuleOptions> => ({
  ...typeORMMetadataModuleOptions,
  name: 'metadata',
});

const coreTypeORMFactory = async (): Promise<TypeOrmModuleOptions> => ({
  ...typeORMCoreModuleOptions,
  name: 'core',
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: metadataTypeORMFactory,
      name: 'metadata',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: coreTypeORMFactory,
      name: 'core',
    }),
    TwentyConfigModule,
  ],
  providers: [TypeORMService],
  exports: [TypeORMService],
})
export class TypeORMModule {}
