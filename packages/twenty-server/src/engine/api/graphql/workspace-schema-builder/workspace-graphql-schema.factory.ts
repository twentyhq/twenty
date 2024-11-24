import { Injectable } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { WorkspaceResolverBuilderMethods } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { TypeDefinitionsGenerator } from './type-definitions.generator';

import { MutationTypeFactory } from './factories/mutation-type.factory';
import { OrphanedTypesFactory } from './factories/orphaned-types.factory';
import { QueryTypeFactory } from './factories/query-type.factory';
import { WorkspaceBuildSchemaOptions } from './interfaces/workspace-build-schema-optionts.interface';

@Injectable()
export class WorkspaceGraphQLSchemaFactory {
  constructor(
    private readonly typeDefinitionsGenerator: TypeDefinitionsGenerator,
    private readonly queryTypeFactory: QueryTypeFactory,
    private readonly mutationTypeFactory: MutationTypeFactory,
    private readonly orphanedTypesFactory: OrphanedTypesFactory,
  ) {}

  async create(
    objectMetadataCollection: ObjectMetadataInterface[],
    workspaceResolverBuilderMethods: WorkspaceResolverBuilderMethods,
    options: WorkspaceBuildSchemaOptions = {},
  ): Promise<GraphQLSchema> {
    // Generate type definitions
    this.typeDefinitionsGenerator.generate(objectMetadataCollection, options);

    // Generate schema
    const schema = new GraphQLSchema({
      query: this.queryTypeFactory.create(
        objectMetadataCollection,
        [...workspaceResolverBuilderMethods.queries],
        options,
      ),
      mutation: this.mutationTypeFactory.create(
        objectMetadataCollection,
        [...workspaceResolverBuilderMethods.mutations],
        options,
      ),
      types: this.orphanedTypesFactory.create(),
    });

    return schema;
  }
}
