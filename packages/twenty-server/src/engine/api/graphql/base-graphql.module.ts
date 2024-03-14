import { Module } from '@nestjs/common';

import { GraphQLSchemaFactory } from 'src/engine/api/graphql/graphql-schema.factory';
import { ScalarsExplorerService } from 'src/engine/api/graphql/scalars-explorer.service';
import { WorkspaceQueryBuilderModule } from 'src/engine/api/graphql/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { WorkspaceResolverBuilderModule } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.module';
import { WorkspaceSchemaBuilderModule } from 'src/engine/api/graphql/workspace-schema-builder/workspace-schema-builder.module';
import { WorkspaceSchemaStorageModule } from 'src/engine/api/graphql/workspace-schema-storage/workspace-schema-storage.module';

@Module({
  imports: [
    WorkspaceQueryBuilderModule,
    WorkspaceQueryRunnerModule,
    WorkspaceResolverBuilderModule,
    WorkspaceSchemaBuilderModule,
    WorkspaceSchemaStorageModule,
  ],
  providers: [GraphQLSchemaFactory, ScalarsExplorerService],
  exports: [GraphQLSchemaFactory],
})
export class BaseGraphQLModule {}
