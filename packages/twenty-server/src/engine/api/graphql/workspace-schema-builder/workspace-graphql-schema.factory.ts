import { Injectable } from '@nestjs/common';

import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import {
  WorkspaceGraphQLSchemaException,
  WorkspaceGraphQLSchemaExceptionCode,
} from 'src/engine/api/graphql/workspace-schema-builder/exceptions/workspace-graphql-schema.exception';
import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';

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

    if (!isDefined(queryType)) {
      throw new WorkspaceGraphQLSchemaException(
        'Query type not found in GqlTypesStorage',
        WorkspaceGraphQLSchemaExceptionCode.QUERY_TYPE_NOT_FOUND,
      );
    }

    if (!isDefined(mutationType)) {
      throw new WorkspaceGraphQLSchemaException(
        'Mutation type not found in GqlTypesStorage',
        WorkspaceGraphQLSchemaExceptionCode.MUTATION_TYPE_NOT_FOUND,
      );
    }

    return new GraphQLSchema({
      query: queryType,
      mutation: mutationType,
      types: gqlTypesStorage.getAllGqlTypesExcept([
        GqlOperation.Query,
        GqlOperation.Mutation,
      ]),
    });
  }
}
