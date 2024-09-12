import { Module } from '@nestjs/common';

import { GraphqlQueryRunnerService } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

@Module({
  imports: [FeatureFlagModule],
  providers: [GraphqlQueryRunnerService],
  exports: [GraphqlQueryRunnerService],
})
export class GraphqlQueryRunnerModule {}
