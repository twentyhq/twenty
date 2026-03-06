import { Injectable } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { type GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { type OrphanedTypesGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/orphaned-types.generator';
import { type MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/mutation-type.generator';
import { type QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/query-type.generator';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';

@Injectable()
export class WorkspaceGraphQLSchemaGenerator {
  constructor(
    private readonly gqlTypeGenerator: GqlTypeGenerator,
    private readonly queryTypeGenerator: QueryTypeGenerator,
    private readonly mutationTypeGenerator: MutationTypeGenerator,
    private readonly orphanedTypesGenerator: OrphanedTypesGenerator,
  ) {}

  async generateSchema(
    context: SchemaGenerationContext,
  ): Promise<GraphQLSchema> {
    await this.gqlTypeGenerator.buildAndStore(context);

    // Assemble schema
    const schema = new GraphQLSchema({
      query: this.queryTypeGenerator.fetchQueryType(),
      mutation: this.mutationTypeGenerator.fetchMutationType(),
      types: this.orphanedTypesGenerator.fetchOrphanedTypes(),
    });

    return schema;
  }
}
