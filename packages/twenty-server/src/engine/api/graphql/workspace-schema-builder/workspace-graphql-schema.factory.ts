import { Injectable } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { type WorkspaceResolverBuilderMethods } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/gql-type.generator';
import { MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/mutation-type.generator';
import { OrphanedTypesGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/orphaned-types.generator';
import { QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/query-type.generator';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

import { type WorkspaceBuildSchemaOptions } from './interfaces/workspace-build-schema-options.interface';

@Injectable()
export class WorkspaceGraphQLSchemaGenerator {
  constructor(
    private readonly gqlTypeGenerator: GqlTypeGenerator,
    private readonly queryTypeGenerator: QueryTypeGenerator,
    private readonly mutationTypeGenerator: MutationTypeGenerator,
    private readonly orphanedTypesGenerator: OrphanedTypesGenerator,
  ) {}

  async generateSchema(
    objectMetadataCollection: ObjectMetadataEntity[],
    workspaceResolverBuilderMethods: WorkspaceResolverBuilderMethods,
    options: WorkspaceBuildSchemaOptions = {},
  ): Promise<GraphQLSchema> {
    // Generate type definitions
    await this.gqlTypeGenerator.generate(objectMetadataCollection, options);

    // Generate schema
    const schema = new GraphQLSchema({
      query: this.queryTypeGenerator.generate(
        objectMetadataCollection,
        [...workspaceResolverBuilderMethods.queries],
        options,
      ),
      mutation: this.mutationTypeGenerator.generate(
        objectMetadataCollection,
        [...workspaceResolverBuilderMethods.mutations],
        options,
      ),
      types: this.orphanedTypesGenerator.generate(),
    });

    return schema;
  }
}
