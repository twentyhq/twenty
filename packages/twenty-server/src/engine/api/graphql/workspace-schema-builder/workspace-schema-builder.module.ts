import { Module } from '@nestjs/common';

import { WorkspaceResolverBuilderModule } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.module';
import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { WorkspaceGraphQLSchemaGenerator } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';

@Module({
  imports: [WorkspaceResolverBuilderModule],
  providers: [
    TypeMapperService,
    GqlTypeGenerator,
    WorkspaceGraphQLSchemaGenerator,
  ],
  exports: [WorkspaceGraphQLSchemaGenerator],
})
export class WorkspaceSchemaBuilderModule {}
