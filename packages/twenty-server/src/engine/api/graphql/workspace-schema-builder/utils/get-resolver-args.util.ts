import { GraphQLString, GraphQLInt, GraphQLID } from 'graphql';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ArgMetadata } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/param-metadata.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';

export const getResolverArgs = (
  type: WorkspaceResolverBuilderMethodNames,
): { [key: string]: ArgMetadata } => {
  switch (type) {
    case 'findMany':
      return {
        first: {
          type: GraphQLInt,
          isNullable: true,
        },
        last: {
          type: GraphQLInt,
          isNullable: true,
        },
        before: {
          type: GraphQLString,
          isNullable: true,
        },
        after: {
          type: GraphQLString,
          isNullable: true,
        },
        limit: {
          type: GraphQLInt,
          isNullable: true,
        },
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: true,
        },
        orderBy: {
          kind: InputTypeDefinitionKind.OrderBy,
          isNullable: true,
        },
      };
    case 'findOne':
    case 'deleteMany':
      return {
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'createMany':
      return {
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: false,
          isArray: true,
        },
      };
    case 'createOne':
      return {
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: false,
        },
      };
    case 'updateOne':
      return {
        id: {
          type: GraphQLID,
          isNullable: false,
        },
        data: {
          kind: InputTypeDefinitionKind.Update,
          isNullable: false,
        },
      };
    case 'findDuplicates':
      return {
        id: {
          type: GraphQLID,
          isNullable: true,
        },
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: true,
        },
      };
    case 'deleteOne':
      return {
        id: {
          type: GraphQLID,
          isNullable: false,
        },
      };
    case 'executeQuickActionOnOne':
      return {
        id: {
          type: GraphQLID,
          isNullable: false,
        },
      };
    case 'updateMany':
      return {
        data: {
          kind: InputTypeDefinitionKind.Update,
          isNullable: false,
        },
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
