import { type FunctionExecutionResult, functionExecute } from 'twenty-sdk/cli';

const APP_PATH = process.cwd();

export const executeSlackLogicFunction = async ({
  universalIdentifier,
  payload,
}: {
  universalIdentifier: string;
  payload?: Record<string, unknown>;
}): Promise<FunctionExecutionResult> => {
  const result = await functionExecute({
    appPath: APP_PATH,
    functionUniversalIdentifier: universalIdentifier,
    payload: payload ?? {},
  });

  if (!result.success) {
    throw new Error(
      `Could not run logic function ${universalIdentifier}: [${result.error.code}] ${result.error.message}`,
    );
  }

  return result.data;
};

export const runSlackLogicFunction = async <TData>({
  universalIdentifier,
  payload,
}: {
  universalIdentifier: string;
  payload?: Record<string, unknown>;
}): Promise<TData> => {
  const execution = await executeSlackLogicFunction({
    universalIdentifier,
    payload,
  });

  if (execution.status !== 'SUCCESS') {
    throw new Error(
      `${execution.functionName} ended with status ${execution.status}: ${
        execution.error?.errorMessage ?? 'no error message'
      }\nLogs:\n${execution.logs}`,
    );
  }

  return execution.data as TData;
};

export const runFailingSlackLogicFunction = async ({
  universalIdentifier,
  payload,
}: {
  universalIdentifier: string;
  payload?: Record<string, unknown>;
}): Promise<{ errorMessage: string; logs: string }> => {
  const execution = await executeSlackLogicFunction({
    universalIdentifier,
    payload,
  });

  if (execution.status !== 'ERROR') {
    throw new Error(
      `${execution.functionName} was expected to fail but ended with status ${
        execution.status
      } and data ${JSON.stringify(execution.data)}`,
    );
  }

  return {
    errorMessage: execution.error?.errorMessage ?? '',
    logs: execution.logs,
  };
};
