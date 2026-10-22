import {
  MetadataApiClient,
  type MetadataSchema,
} from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const executeDeployedFunctionOrThrow = async ({
  functionName,
  payload,
}: {
  functionName: string;
  payload: Record<string, unknown>;
}): Promise<
  Omit<MetadataSchema.LogicFunctionExecutionResult, '__typename'>
> => {
  const client = new MetadataApiClient();
  const {
    findOneApplication: application,
    findManyLogicFunctions: logicFunctions,
  } = await client.query({
    findOneApplication: {
      __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      id: true,
    },
    findManyLogicFunctions: { id: true, name: true, applicationId: true },
  });
  const matches = logicFunctions.filter(
    (logicFunction) =>
      logicFunction.applicationId === application.id &&
      logicFunction.name === functionName,
  );
  if (matches.length !== 1) {
    throw new Error(
      `Expected one deployed app function named ${functionName}, found ${matches.length}`,
    );
  }

  const { executeOneLogicFunction } = await client.mutation({
    executeOneLogicFunction: {
      __args: { input: { id: matches[0].id, payload } },
      data: true,
      status: true,
      logs: true,
      duration: true,
      error: true,
    },
  });
  return executeOneLogicFunction;
};
