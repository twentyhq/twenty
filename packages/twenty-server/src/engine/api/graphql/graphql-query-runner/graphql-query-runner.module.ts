import { Module } from '@nestjs/common';

import { GraphqlQueryRunnerService } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.service';

@Module({
  providers: [GraphqlQueryRunnerService],
  exports: [GraphqlQueryRunnerService],
})
export class GraphqlQueryRunnerModule {}
