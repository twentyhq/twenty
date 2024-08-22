import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLString } from 'graphql';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';

describe('getResolverArgs', () => {
  const expectedOutputs = {
    findMany: {
      first: { type: GraphQLInt, isNullable: true },
      last: { type: GraphQLInt, isNullable: true },
      before: { type: GraphQLString, isNullable: true },
      after: { type: GraphQLString, isNullable: true },
      filter: { kind: InputTypeDefinitionKind.Filter, isNullable: true },
      orderBy: {
        kind: InputTypeDefinitionKind.OrderBy,
        isNullable: true,
        isArray: true,
      },
      limit: { type: GraphQLInt, isNullable: true },
    },
    findOne: {
      filter: { kind: InputTypeDefinitionKind.Filter, isNullable: false },
    },
    createMany: {
      data: {
        kind: InputTypeDefinitionKind.Create,
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
      data: { kind: InputTypeDefinitionKind.Create, isNullable: false },
      upsert: {
        isArray: false,
        isNullable: true,
        type: GraphQLBoolean,
      },
    },
    updateOne: {
      id: { type: GraphQLID, isNullable: false },
      data: { kind: InputTypeDefinitionKind.Update, isNullable: false },
    },
    deleteOne: {
      id: { type: GraphQLID, isNullable: false },
    },
    restoreMany: {
      filter: { kind: InputTypeDefinitionKind.Filter, isNullable: false },
    },
    destroyMany: {
      filter: { kind: InputTypeDefinitionKind.Filter, isNullable: false },
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
