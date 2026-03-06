import { Injectable } from '@nestjs/common';

import { isObjectType, type GraphQLObjectType } from 'graphql';

import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import { RootTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/root-type.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';

@Injectable()
export class MutationTypeGenerator {
  constructor(
    private readonly rootTypeGenerator: RootTypeGenerator,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  buildAndStore(context: SchemaGenerationContext) {
    return this.rootTypeGenerator.buildAndStore(
      context,
      [...workspaceResolverBuilderMethodNames.mutations],
      GqlOperation.Mutation,
    );
  }

  fetchMutationType(): GraphQLObjectType {
    const mutationType = this.gqlTypesStorage.getGqlTypeByKey(
      GqlOperation.Mutation,
    );

    if (!mutationType || !isObjectType(mutationType)) {
      throw new Error('Mutation type not found');
    }

    return mutationType;
  }
}
