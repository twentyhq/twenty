import { Module } from '@nestjs/common';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceGraphqlSchemaSDLModule } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.module';
import { WorkspaceResolverBuilderModule } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.module';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceSchemaFactory } from './workspace-schema.factory';

@Module({
  imports: [
    WorkspaceResolverBuilderModule,
    WorkspaceGraphqlSchemaSDLModule,
    MetricsModule,
  ],
  providers: [WorkspaceSchemaFactory, ScalarsExplorerService],
  exports: [WorkspaceSchemaFactory],
})
export class CoreGraphQLApiModule {}
