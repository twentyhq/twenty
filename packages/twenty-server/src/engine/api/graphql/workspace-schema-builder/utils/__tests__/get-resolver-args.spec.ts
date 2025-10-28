import { GraphQLBoolean, GraphQLInt, GraphQLString } from 'graphql';

import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';

describe('getResolverArgs', () => {
  const expectedOutputs = {
    findMany: {
      first: { type: GraphQLInt, isNullable: true },
      last: { type: GraphQLInt, isNullable: true },
      before: { type: GraphQLString, isNullable: true },
      after: { type: GraphQLString, isNullable: true },
      filter: { kind: GqlInputTypeDefinitionKind.Filter, isNullable: true },
      orderBy: {
        kind: GqlInputTypeDefinitionKind.OrderBy,
        isNullable: true,
        isArray: true,
      },
      offset: { type: GraphQLInt, isNullable: true },
    },
    findOne: {
      filter: { kind: GqlInputTypeDefinitionKind.Filter, isNullable: false },
    },
    createMany: {
      data: {
        kind: GqlInputTypeDefinitionKind.Create,
        isNullable: false,
        isArray: true,
      },
      upsert: {
        isArray: false,
        isNullable: true,
        type: GraphQLBoolean,
      },
    },
    createOne: {
      data: { kind: GqlInputTypeDefinitionKind.Create, isNullable: false },
      upsert: {
        isArray: false,
        isNullable: true,
        type: GraphQLBoolean,
      },
    },
    updateOne: {
      id: { type: UUIDScalarType, isNullable: false },
      data: { kind: GqlInputTypeDefinitionKind.Update, isNullable: false },
    },
    deleteOne: {
      id: { type: UUIDScalarType, isNullable: false },
    },
    restoreMany: {
      filter: { kind: GqlInputTypeDefinitionKind.Filter, isNullable: false },
    },
    destroyMany: {
      filter: { kind: GqlInputTypeDefinitionKind.Filter, isNullable: false },
    },
  };

  // Test each resolver type
  Object.entries(expectedOutputs).forEach(([resolverType, expectedOutput]) => {
    it(`should return correct args for ${resolverType} resolver`, () => {
      expect(
        getResolverArgs(resolverType as WorkspaceResolverBuilderMethodNames),
      ).toEqual(expectedOutput);
    });
  });

  // Test for an unknown resolver type
  it('should throw an error for an unknown resolver type', () => {
    const unknownType = 'unknownType';

    expect(() =>
      getResolverArgs(unknownType as WorkspaceResolverBuilderMethodNames),
    ).toThrow(`Unknown resolver type: ${unknownType}`);
  });
});
