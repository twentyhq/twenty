import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

import { TypeDefinitionsGenerator } from './type-definitions.generator';
import { WorkspaceGraphQLSchemaFactory } from './workspace-graphql-schema.factory';

import { workspaceSchemaBuilderFactories } from './factories/factories';
import { TypeDefinitionsStorage } from './storages/type-definitions.storage';
import { TypeMapperService } from './services/type-mapper.service';

@Module({
  imports: [ObjectMetadataModule],
  providers: [
    TypeDefinitionsStorage,
    TypeMapperService,
    ...workspaceSchemaBuilderFactories,
    TypeDefinitionsGenerator,
    WorkspaceGraphQLSchemaFactory,
  ],
  exports: [WorkspaceGraphQLSchemaFactory],
})
export class WorkspaceSchemaBuilderModule {}
