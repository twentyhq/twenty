import { Injectable } from '@nestjs/common';

import { GraphQLObjectType, isObjectType } from 'graphql';

import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import { RootTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/root-type.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';

@Injectable()
export class QueryTypeGenerator {
  constructor(
    private readonly rootTypeGenerator: RootTypeGenerator,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  async buildAndStore(context: SchemaGenerationContext) {
    return this.rootTypeGenerator.buildAndStore(
      context,
      workspaceResolverBuilderMethodNames.queries,
      GqlOperation.Query,
    );
  }

  fetchQueryType(): GraphQLObjectType {
    const queryType = this.gqlTypesStorage.getGqlTypeByKey(GqlOperation.Query);

    if (!queryType || !isObjectType(queryType)) {
      throw new Error('Query type not found');
    }

    return queryType;
  }
}
