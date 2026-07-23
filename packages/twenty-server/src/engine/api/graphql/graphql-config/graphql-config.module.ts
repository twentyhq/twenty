import { Module } from '@nestjs/common';

import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { DirectExecutionModule } from 'src/engine/api/graphql/direct-execution/direct-execution.module';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';

@Module({
  imports: [CoreEngineModule, DirectExecutionModule, WorkspaceCacheModule],
  providers: [],
  exports: [CoreEngineModule, DirectExecutionModule, WorkspaceCacheModule],
})
export class GraphQLConfigModule {}
