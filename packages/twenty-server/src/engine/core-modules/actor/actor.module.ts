import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatedByCreateManyPreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-many.pre-query-hook';
import { CreatedByCreateOnePreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-one.pre-query-hook';
import { UpdatedByUpdateManyPreQueryHook } from 'src/engine/core-modules/actor/query-hooks/updated-by.update-many.pre-query-hook';
import { UpdatedByUpdateOnePreQueryHook } from 'src/engine/core-modules/actor/query-hooks/updated-by.update-one.pre-query-hook';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

import { ActorFromAuthContextService } from './services/actor-from-auth-context.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    CreatedByCreateManyPreQueryHook,
    CreatedByCreateOnePreQueryHook,
    UpdatedByUpdateManyPreQueryHook,
    UpdatedByUpdateOnePreQueryHook,
    ActorFromAuthContextService,
  ],
  exports: [
    CreatedByCreateManyPreQueryHook,
    CreatedByCreateOnePreQueryHook,
    UpdatedByUpdateManyPreQueryHook,
    UpdatedByUpdateOnePreQueryHook,
    ActorFromAuthContextService,
  ],
})
export class ActorModule {}
