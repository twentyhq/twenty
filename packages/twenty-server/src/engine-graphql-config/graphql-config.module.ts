import { Module } from '@nestjs/common';

import { EngineModulesModule } from 'src/engine/modules/engine-modules.module';
import { graphQLFactories } from 'src/engine-graphql-config/factories';

@Module({
  imports: [EngineModulesModule],
  providers: [...graphQLFactories],
  exports: [...graphQLFactories],
})
export class GraphQLConfigModule {}
