import { Module } from '@nestjs/common';

import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';

@Module({
  imports: [CoreEngineModule],
  providers: [],
  exports: [CoreEngineModule],
})
export class GraphQLConfigModule {}
