import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatedByCreateManyPreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-many.pre-query-hook';
import { CreatedByCreateOnePreQueryHook } from 'src/engine/core-modules/actor/query-hooks/created-by.create-one.pre-query-hook';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

import { CreatedByFromAuthContextService } from './services/created-by-from-auth-context.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    CreatedByCreateManyPreQueryHook,
    CreatedByCreateOnePreQueryHook,
    CreatedByFromAuthContextService,
  ],
  exports: [
    CreatedByCreateManyPreQueryHook,
    CreatedByCreateOnePreQueryHook,
    CreatedByFromAuthContextService,
  ],
})
export class ActorModule {}
