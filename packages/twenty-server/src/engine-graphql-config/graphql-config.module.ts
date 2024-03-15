import { Module } from '@nestjs/common';

import { FoundationModule } from 'src/engine/modules/foundation.module';
import { graphQLFactories } from 'src/engine-graphql-config/factories';

@Module({
  imports: [FoundationModule],
  providers: [...graphQLFactories],
  exports: [...graphQLFactories],
})
export class GraphQLConfigModule {}
