import { Injectable } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { OrphanedTypesGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/orphaned-types.generator';
import { MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/mutation-type.generator';
import { QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/query-type.generator';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class WorkspaceGraphQLSchemaGenerator {
  constructor(
    private readonly gqlTypeGenerator: GqlTypeGenerator,
    private readonly queryTypeGenerator: QueryTypeGenerator,
    private readonly mutationTypeGenerator: MutationTypeGenerator,
    private readonly orphanedTypesGenerator: OrphanedTypesGenerator,
  ) {}

  generateSchema(
    objectMetadataCollection: ObjectMetadataEntity[],
  ): GraphQLSchema {
    this.gqlTypeGenerator.buildAndStore(objectMetadataCollection);

    // Assemble schema
    const schema = new GraphQLSchema({
      query: this.queryTypeGenerator.fetchQueryType(),
      mutation: this.mutationTypeGenerator.fetchMutationType(),
      types: this.orphanedTypesGenerator.fetchOrphanedTypes(),
    });

    return schema;
  }
}
