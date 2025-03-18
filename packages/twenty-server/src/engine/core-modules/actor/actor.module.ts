import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatedByCreateManyPreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-many.pre-query-hook';
import { CreatedByCreateOnePreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-one.pre-query-hook';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CrudByFromAuthContextService } from 'src/engine/core-modules/actor/services/crud-by-from-auth-context.service';
import { UpdatedByUpdateManyPreQueryHook } from 'src/engine/core-modules/actor/query-hooks/updated-by.update-many.pre-query-hook';
import { UpdatedByUpdateOnePreQueryHook } from 'src/engine/core-modules/actor/query-hooks/updated-by.update-one.pre-query-hook';

@Module({
  imports: [TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata')],
  providers: [
    CreatedByCreateManyPreQueryHook,
    CreatedByCreateOnePreQueryHook,
    UpdatedByUpdateManyPreQueryHook,
    UpdatedByUpdateOnePreQueryHook,
    CrudByFromAuthContextService,
  ],
  exports: [
    CreatedByCreateManyPreQueryHook,
    CreatedByCreateOnePreQueryHook,
    UpdatedByUpdateManyPreQueryHook,
    UpdatedByUpdateOnePreQueryHook,
    CrudByFromAuthContextService,
  ],
})
export class ActorModule {}
