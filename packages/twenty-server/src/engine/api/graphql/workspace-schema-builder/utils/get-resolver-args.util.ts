import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';

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
          isArray: true,
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
        upsert: {
          type: GraphQLBoolean,
          isNullable: true,
          isArray: false,
        },
      };
    case 'createOne':
      return {
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: false,
        },
        upsert: {
          type: GraphQLBoolean,
          isNullable: true,
          isArray: false,
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
        ids: {
          type: GraphQLID,
          isNullable: true,
          isArray: true,
        },
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: true,
          isArray: true,
        },
      };
    case 'deleteOne':
      return {
        id: {
          type: GraphQLID,
          isNullable: false,
        },
      };
    case 'destroyOne':
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
    case 'restoreMany':
      return {
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'restoreOne':
      return {
        id: {
          type: GraphQLID,
          isNullable: false,
        },
      };
    case 'destroyMany':
      return {
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'search':
      return {
        searchInput: {
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
      };
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
