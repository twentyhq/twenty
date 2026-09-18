import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';

import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  buildSchema,
  isScalarType,
  lexicographicSortSchema,
  printType,
  validateSchema,
  type GraphQLNamedType,
  type GraphQLSchema,
} from 'graphql';

import { appendCoreWorkflowAppOperationsToSdl } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/append-core-workflow-app-operations-to-sdl.util';
import {
  CORE_WORKFLOW_APP_MUTATION_NAMES,
  CORE_WORKFLOW_APP_QUERY_NAMES,
} from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/build-core-workflow-app-operations-sdl.util';
import { CoreWorkflowVersionMutationResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow-version-mutation.resolver';
import { CoreWorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow.resolver';

jest.setTimeout(60000);

const BASE_SDL = /* GraphQL */ `
  scalar UUID

  type Company {
    id: UUID!
    name: String
  }

  type Query {
    companies: [Company!]!
  }

  type Mutation {
    createCompany: Company
  }
`;

const describeField = (schema: GraphQLSchema, operationName: string) => {
  const field =
    schema.getQueryType()?.getFields()[operationName] ??
    schema.getMutationType()?.getFields()[operationName];

  return {
    type: field?.type.toString(),
    args: field?.args
      .map((argument) => `${argument.name}: ${argument.type.toString()}`)
      .sort(),
  };
};

describe('appendCoreWorkflowAppOperationsToSdl', () => {
  let coreSchema: GraphQLSchema;
  let mergedSchema: GraphQLSchema;

  beforeAll(async () => {
    const applicationContext = await NestFactory.createApplicationContext(
      GraphQLSchemaBuilderModule,
      { logger: false },
    );

    coreSchema = await applicationContext
      .get(GraphQLSchemaFactory)
      .create([CoreWorkflowResolver, CoreWorkflowVersionMutationResolver]);

    await applicationContext.close();

    mergedSchema = buildSchema(
      await appendCoreWorkflowAppOperationsToSdl(BASE_SDL),
    );
  });

  it('produces a valid schema that keeps the workspace operations', () => {
    expect(validateSchema(mergedSchema)).toEqual([]);
    expect(mergedSchema.getQueryType()?.getFields()).toHaveProperty(
      'companies',
    );
    expect(mergedSchema.getMutationType()?.getFields()).toHaveProperty(
      'createCompany',
    );
  });

  it.each([
    ...CORE_WORKFLOW_APP_QUERY_NAMES,
    ...CORE_WORKFLOW_APP_MUTATION_NAMES,
  ])(
    'exposes %s with the signature the core schema declares',
    (operationName) => {
      const coreField = describeField(coreSchema, operationName);

      expect(coreField.type).toBeDefined();
      expect(describeField(mergedSchema, operationName)).toEqual(coreField);
    },
  );

  it('carries every referenced type over unchanged', () => {
    const coreTypeNames = Object.values(coreSchema.getTypeMap())
      .filter(
        (type: GraphQLNamedType) =>
          !type.name.startsWith('__') && !isScalarType(type),
      )
      .map((type) => type.name)
      .filter((typeName) => !['Query', 'Mutation'].includes(typeName));

    const referencedTypeNames = coreTypeNames.filter((typeName) =>
      Boolean(mergedSchema.getType(typeName)),
    );

    expect(referencedTypeNames.length).toBeGreaterThan(0);

    const sortedCoreSchema = lexicographicSortSchema(coreSchema);

    for (const typeName of referencedTypeNames) {
      const mergedType = mergedSchema.getType(typeName);
      const coreType = sortedCoreSchema.getType(typeName);

      expect(mergedType && printType(mergedType)).toEqual(
        coreType && printType(coreType),
      );
    }
  });

  it('is accepted by the sdk client generator schema builder', async () => {
    const typeDefs = await appendCoreWorkflowAppOperationsToSdl(BASE_SDL);

    expect(() => makeExecutableSchema({ typeDefs })).not.toThrow();
  });
});
