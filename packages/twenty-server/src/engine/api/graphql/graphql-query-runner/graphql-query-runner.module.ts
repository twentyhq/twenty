import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleTargetEntity]), ViewModule],
  providers: [ProcessNestedRelationsHelper, ProcessAggregateHelper],
})
export class GraphqlQueryRunnerModule {}
