import { Module } from '@nestjs/common';

import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { graphQLFactories } from 'src/engine/api/graphql/graphql-config/factories';

@Module({
  imports: [CoreEngineModule],
  providers: [...graphQLFactories],
  exports: [...graphQLFactories],
})
export class GraphQLConfigModule {}
