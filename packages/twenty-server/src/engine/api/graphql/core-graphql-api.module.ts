import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { WorkspaceSchemaStorageModule } from 'src/engine/api/graphql/workspace-schema-storage/workspace-schema-storage.module';
import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceSchemaBuilderModule } from 'src/engine/api/graphql/workspace-schema-builder/workspace-schema-builder.module';
import { WorkspaceResolverBuilderModule } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.module';
import { MetadataEngineModule } from 'src/engine/metadata-modules/metadata-engine.module';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { GraphQLConfigService } from 'src/engine/api/graphql/graphql-config/graphql-config.service';

import { WorkspaceSchemaFactory } from './workspace-schema.factory';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [CoreEngineModule, GraphQLConfigModule],
      useClass: GraphQLConfigService,
    }),
    MetadataEngineModule,
    WorkspaceSchemaBuilderModule,
    WorkspaceResolverBuilderModule,
    WorkspaceSchemaStorageModule,
  ],
  providers: [WorkspaceSchemaFactory, ScalarsExplorerService],
  exports: [WorkspaceSchemaFactory],
})
export class CoreGraphQLApiModule {}
