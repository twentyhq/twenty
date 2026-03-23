import { Module } from '@nestjs/common';

import { DirectExecutionModule } from 'src/engine/api/graphql/direct-execution/direct-execution.module';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';

@Module({
  imports: [CoreEngineModule, DirectExecutionModule],
  providers: [],
  exports: [CoreEngineModule, DirectExecutionModule],
})
export class GraphQLConfigModule {}
