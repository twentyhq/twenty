import { GraphQLBoolean, GraphQLInt, GraphQLString } from 'graphql';

import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type ArgMetadata } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/param-metadata.interface';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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
        offset: {
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
        filter: {
          kind: GqlInputTypeDefinitionKind.Filter,
          isNullable: true,
        },
        orderBy: {
          kind: GqlInputTypeDefinitionKind.OrderBy,
          isNullable: true,
          isArray: true,
        },
      };
    case 'findOne':
    case 'deleteMany':
      return {
        filter: {
          kind: GqlInputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'createMany':
      return {
        data: {
          kind: GqlInputTypeDefinitionKind.Create,
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
          kind: GqlInputTypeDefinitionKind.Create,
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
          type: UUIDScalarType,
          isNullable: false,
        },
        data: {
          kind: GqlInputTypeDefinitionKind.Update,
          isNullable: false,
        },
      };
    case 'findDuplicates':
      return {
        ids: {
          type: UUIDScalarType,
          isNullable: true,
          isArray: true,
        },
        data: {
          kind: GqlInputTypeDefinitionKind.Create,
          isNullable: true,
          isArray: true,
        },
      };
    case 'deleteOne':
      return {
        id: {
          type: UUIDScalarType,
          isNullable: false,
        },
      };
    case 'destroyOne':
      return {
        id: {
          type: UUIDScalarType,
          isNullable: false,
        },
      };
    case 'updateMany':
      return {
        data: {
          kind: GqlInputTypeDefinitionKind.Update,
          isNullable: false,
        },
        filter: {
          kind: GqlInputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'restoreMany':
      return {
        filter: {
          kind: GqlInputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'restoreOne':
      return {
        id: {
          type: UUIDScalarType,
          isNullable: false,
        },
      };
    case 'destroyMany':
      return {
        filter: {
          kind: GqlInputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'mergeMany':
      return {
        ids: {
          type: UUIDScalarType,
          isNullable: false,
          isArray: true,
        },
        conflictPriorityIndex: {
          type: GraphQLInt,
          isNullable: false,
        },
        dryRun: {
          type: GraphQLBoolean,
          isNullable: true,
        },
      };
    case 'groupBy':
      return {
        groupBy: {
          kind: GqlInputTypeDefinitionKind.GroupBy,
          isNullable: false,
          isArray: true,
        },
        filter: {
          kind: GqlInputTypeDefinitionKind.Filter,
          isNullable: true,
        },
        orderBy: {
          kind: GqlInputTypeDefinitionKind.OrderByWithGroupBy,
          isNullable: true,
          isArray: true,
        },
        orderByForRecords: {
          kind: GqlInputTypeDefinitionKind.OrderBy,
          isNullable: true,
          isArray: true,
        },
        viewId: {
          type: UUIDScalarType,
          isNullable: true,
        },
        limit: {
          type: GraphQLInt,
          isNullable: true,
        },
        offsetForRecords: {
          type: GraphQLInt,
          isNullable: true,
        },
      };
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
