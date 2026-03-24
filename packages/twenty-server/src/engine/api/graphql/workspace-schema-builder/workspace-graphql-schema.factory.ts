import { Injectable } from '@nestjs/common';

import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class WorkspaceGraphQLSchemaGenerator {
  constructor(private readonly gqlTypeGenerator: GqlTypeGenerator) {}

  async generateSchema(
    context: SchemaGenerationContext,
  ): Promise<GraphQLSchema> {
    const gqlTypesStorage = await this.gqlTypeGenerator.buildAndStore(context);

    const queryType = gqlTypesStorage.getGqlTypeByKey<GraphQLObjectType>(
      GqlOperation.Query,
    );
    const mutationType = gqlTypesStorage.getGqlTypeByKey<GraphQLObjectType>(
      GqlOperation.Mutation,
    );

    if (!isDefined(queryType) || !isDefined(mutationType)) {
      throw new Error('PRASTOIN TODO');
    }

    const types = gqlTypesStorage.getAllGqlTypesExcept([
      GqlOperation.Query,
      GqlOperation.Mutation,
    ]);

    return new GraphQLSchema({
      query: queryType,
      mutation: mutationType,
      types,
    });
  }
}
