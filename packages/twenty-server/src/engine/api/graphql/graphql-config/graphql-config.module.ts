import { Module } from '@nestjs/common';

import { graphQLFactories } from 'src/engine/api/graphql/graphql-config/factories';
import { FeaturesModule } from 'src/engine/features/features.module';

@Module({
  imports: [FeaturesModule],
  providers: [...graphQLFactories],
  exports: [...graphQLFactories],
})
export class GraphQLConfigModule {}
