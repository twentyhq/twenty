import { Injectable } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { type WorkspaceResolverBuilderMethods } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/mutation-type.generator';
import { QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/query-type.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class WorkspaceGraphQLSchemaGenerator {
  constructor(
    private readonly gqlTypeGenerator: GqlTypeGenerator,
    private readonly queryTypeGenerator: QueryTypeGenerator,
    private readonly mutationTypeGenerator: MutationTypeGenerator,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  generateSchema(
    objectMetadataCollection: ObjectMetadataEntity[],
    workspaceResolverBuilderMethods: WorkspaceResolverBuilderMethods,
  ): GraphQLSchema {
    this.gqlTypeGenerator.buildAndStore(objectMetadataCollection);

    // Generate schema
    const schema = new GraphQLSchema({
      query: this.queryTypeGenerator.generate(objectMetadataCollection, [
        ...workspaceResolverBuilderMethods.queries,
      ]),
      mutation: this.mutationTypeGenerator.generate(objectMetadataCollection, [
        ...workspaceResolverBuilderMethods.mutations,
      ]),
      types: this.gqlTypesStorage.getAllGqlTypes(),
    });

    return schema;
  }
}
