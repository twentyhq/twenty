import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatedByCreateManyPreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-many.pre-query-hook';
import { CreatedByCreateOnePreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-one.pre-query-hook';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata')],
  providers: [CreatedByCreateManyPreQueryHook, CreatedByCreateOnePreQueryHook],
  exports: [CreatedByCreateManyPreQueryHook, CreatedByCreateOnePreQueryHook],
})
export class ActorModule {}
