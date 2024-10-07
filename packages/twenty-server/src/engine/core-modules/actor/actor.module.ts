import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatedByPreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.pre-query-hook';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata')],
  providers: [CreatedByPreQueryHook],
  exports: [CreatedByPreQueryHook],
})
export class ActorModule {}
