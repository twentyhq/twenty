import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';

import {
  GraphQLObjectType,
  GraphQLSchema,
  isInterfaceType,
  lexicographicSortSchema,
  printSchema,
  type GraphQLFieldConfigMap,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow.resolver';

export const CORE_WORKFLOW_APP_QUERY_NAMES = [
  'coreWorkflows',
  'coreWorkflowVersionsByCoreWorkflowId',
];

type RootTypeConfig = ReturnType<GraphQLObjectType['toConfig']>;

const pickRootType = ({
  rootTypeConfig,
  operationNames,
}: {
  rootTypeConfig: RootTypeConfig;
  operationNames: string[];
}): GraphQLObjectType => {
  const missingOperationNames = operationNames.filter(
    (operationName) => !isDefined(rootTypeConfig.fields[operationName]),
  );

  if (missingOperationNames.length > 0) {
    throw new Error(
      `Core workflow operations missing from the ${rootTypeConfig.name} type: ${missingOperationNames.join(', ')}`,
    );
  }

  const fields: GraphQLFieldConfigMap<unknown, unknown> = Object.fromEntries(
    operationNames.map((operationName) => [
      operationName,
      rootTypeConfig.fields[operationName],
    ]),
  );

  return new GraphQLObjectType({ ...rootTypeConfig, fields });
};

const buildSlice = async (): Promise<string> => {
  const applicationContext = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
  );

  try {
    const coreSchema = await applicationContext
      .get(GraphQLSchemaFactory)
      .create([CoreWorkflowResolver]);

    const queryTypeConfig = coreSchema.getQueryType()?.toConfig();

    if (!isDefined(queryTypeConfig)) {
      throw new Error('Core workflow resolvers produced no Query type');
    }

    const query = pickRootType({
      rootTypeConfig: queryTypeConfig,
      operationNames: CORE_WORKFLOW_APP_QUERY_NAMES,
    });

    const reachableTypes = Object.values(
      new GraphQLSchema({ query }).getTypeMap(),
    );
    const interfaceImplementations = reachableTypes
      .filter(isInterfaceType)
      .flatMap((interfaceType) => coreSchema.getPossibleTypes(interfaceType));

    return printSchema(
      lexicographicSortSchema(
        new GraphQLSchema({ query, types: interfaceImplementations }),
      ),
    );
  } finally {
    await applicationContext.close();
  }
};

let coreWorkflowAppOperationsSdlPromise: Promise<string> | undefined;

export const buildCoreWorkflowAppOperationsSdl = (): Promise<string> => {
  coreWorkflowAppOperationsSdlPromise ??= buildSlice();

  return coreWorkflowAppOperationsSdlPromise;
};
