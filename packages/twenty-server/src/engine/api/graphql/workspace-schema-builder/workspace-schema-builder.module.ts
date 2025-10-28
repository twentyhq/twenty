import { Module } from '@nestjs/common';

import { WorkspaceResolverBuilderModule } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.module';
import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { workspaceSchemaBuilderTypeGenerators } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/type-generators';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { WorkspaceGraphQLSchemaGenerator } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

import { TypeMapperService } from './services/type-mapper.service';
@Module({
  imports: [
    ObjectMetadataModule,
    WorkspaceResolverBuilderModule,
    FeatureFlagModule,
  ],
  providers: [
    GqlTypesStorage,
    TypeMapperService,
    ...workspaceSchemaBuilderTypeGenerators,
    GqlTypeGenerator,
    WorkspaceGraphQLSchemaGenerator,
  ],
  exports: [WorkspaceGraphQLSchemaGenerator],
})
export class WorkspaceSchemaBuilderModule {}
