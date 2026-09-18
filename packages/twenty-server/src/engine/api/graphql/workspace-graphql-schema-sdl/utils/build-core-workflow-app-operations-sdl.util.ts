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

import { CoreWorkflowVersionMutationResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow-version-mutation.resolver';
import { CoreWorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow.resolver';

export const CORE_WORKFLOW_APP_QUERY_NAMES = [
  'coreWorkflows',
  'coreWorkflowVersionsByCoreWorkflowId',
];

export const CORE_WORKFLOW_APP_MUTATION_NAMES = [
  'createCoreWorkflow',
  'updateCoreWorkflowVersionTrigger',
  'createCoreWorkflowVersionStep',
  'updateCoreWorkflowVersionStep',
  'activateCoreWorkflowVersion',
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
    { logger: false },
  );

  try {
    const coreSchema = await applicationContext
      .get(GraphQLSchemaFactory)
      .create([CoreWorkflowResolver, CoreWorkflowVersionMutationResolver]);

    const queryTypeConfig = coreSchema.getQueryType()?.toConfig();
    const mutationTypeConfig = coreSchema.getMutationType()?.toConfig();

    if (!isDefined(queryTypeConfig) || !isDefined(mutationTypeConfig)) {
      throw new Error(
        'Core workflow resolvers produced no Query or Mutation type',
      );
    }

    const query = pickRootType({
      rootTypeConfig: queryTypeConfig,
      operationNames: CORE_WORKFLOW_APP_QUERY_NAMES,
    });
    const mutation = pickRootType({
      rootTypeConfig: mutationTypeConfig,
      operationNames: CORE_WORKFLOW_APP_MUTATION_NAMES,
    });

    const reachableTypes = Object.values(
      new GraphQLSchema({ query, mutation }).getTypeMap(),
    );
    const interfaceImplementations = reachableTypes
      .filter(isInterfaceType)
      .flatMap((interfaceType) => coreSchema.getPossibleTypes(interfaceType));

    return printSchema(
      lexicographicSortSchema(
        new GraphQLSchema({ query, mutation, types: interfaceImplementations }),
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
