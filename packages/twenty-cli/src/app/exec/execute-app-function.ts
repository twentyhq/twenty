import { isArray, isNumber, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { createAppNotInstalledError } from '@/app/create-app-not-installed-error';
import { type ExecManifest } from '@/app/exec/read-exec-manifest';
import { type AppFunctionSelector } from '@/app/exec/types/app-function-selector.type';
import { isApplicationNotFoundError } from '@/app/is-application-not-found-error';
import { isSameUniversalIdentifier } from '@/app/is-same-universal-identifier';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { toCliError } from '@/output/to-cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { REQUEST_TIMEOUT_MILLISECONDS } from '@/transport/constants/request-timeout-milliseconds.constant';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

type LogicFunction = {
  id: string;
  name: string;
  universalIdentifier: string | null;
  applicationId: string | null;
  timeoutSeconds: number;
};

const isLogicFunction = (value: unknown): value is LogicFunction =>
  isPlainObject(value) &&
  isString(value.id) &&
  isString(value.name) &&
  (isString(value.universalIdentifier) || value.universalIdentifier === null) &&
  (isString(value.applicationId) || value.applicationId === null) &&
  isNumber(value.timeoutSeconds) &&
  Number.isFinite(value.timeoutSeconds) &&
  value.timeoutSeconds >= 0 &&
  Math.ceil(value.timeoutSeconds * 1000) + REQUEST_TIMEOUT_MILLISECONDS <
    2 ** 31;

const invalidResponse = () =>
  new CliError({
    code: 'INVALID_RESPONSE',
    message: 'The server returned an invalid logic-function response.',
  });

const wasExecutionRejected = (error: CliError) => {
  if (['AUTH_REQUIRED', 'PERMISSION_DENIED'].includes(error.code)) {
    return true;
  }

  const errors = error.details?.errors;

  return (
    error.code === 'GRAPHQL_ERROR' &&
    isArray(errors) &&
    errors.length > 0 &&
    errors.every(
      (entry: unknown) =>
        isPlainObject(entry) &&
        isString(entry.code) &&
        ['NOT_FOUND', 'BAD_USER_INPUT', 'GRAPHQL_VALIDATION_FAILED'].includes(
          entry.code,
        ),
    )
  );
};

export const executeAppFunction = async ({
  manifest,
  selector,
  payload,
  target,
  signal,
  onExecuting,
}: {
  manifest: ExecManifest;
  selector: AppFunctionSelector;
  payload: Record<string, unknown>;
  target: ResolvedTarget;
  signal: AbortSignal;
  onExecuting: (name: string) => void;
}) => {
  const client = createMetadataClient({ target, signal });
  const { applicationUniversalIdentifier } = manifest;
  const {
    findOneApplication: application,
    findManyLogicFunctions: logicFunctions,
  } = await client
    .query({
      findOneApplication: {
        __args: { universalIdentifier: applicationUniversalIdentifier },
        id: true,
        universalIdentifier: true,
      },
      findManyLogicFunctions: {
        id: true,
        name: true,
        universalIdentifier: true,
        applicationId: true,
        timeoutSeconds: true,
      },
    })
    .catch((error: unknown) => {
      if (isApplicationNotFoundError({ error, field: 'findOneApplication' })) {
        throw createAppNotInstalledError({
          universalIdentifier: applicationUniversalIdentifier,
          apiUrl: target.apiUrl,
        });
      }
      throw error;
    });

  if (
    !isPlainObject(application) ||
    !isString(application.id) ||
    !isSameUniversalIdentifier({
      value: application.universalIdentifier,
      universalIdentifier: applicationUniversalIdentifier,
    }) ||
    !isArray(logicFunctions) ||
    !logicFunctions.every(isLogicFunction)
  ) {
    throw invalidResponse();
  }

  const appFunctions = logicFunctions.filter(
    (logicFunction) =>
      logicFunction.applicationId === application.id &&
      isDefined(logicFunction.universalIdentifier) &&
      manifest.universalIdentifiers.includes(
        logicFunction.universalIdentifier.toLowerCase(),
      ),
  );
  const identifier =
    selector.kind === 'hook' ? manifest.hooks[selector.value] : selector.value;
  const matches = appFunctions.filter(
    (logicFunction) =>
      isDefined(identifier) &&
      (selector.kind === 'name'
        ? logicFunction.name === identifier
        : logicFunction.universalIdentifier?.toLowerCase() === identifier),
  );

  if (matches.length === 0) {
    throw new CliError({
      code: 'NOT_FOUND',
      exitCode: EXIT_CODE.NOT_FOUND,
      message: `Function "${selector.value}" was not found in the deployed app.`,
      hint: 'Check the selected workspace and function. Run twenty app apply or twenty app dev to sync local changes first.',
      details: {
        identifier: selector.value,
        availableFunctions: appFunctions.map(
          ({ name, universalIdentifier }) => ({ name, universalIdentifier }),
        ),
      },
    });
  }
  if (matches.length > 1) {
    throw new CliError({
      code: 'AMBIGUOUS_RESOURCE',
      exitCode: EXIT_CODE.CONFLICT,
      message: `More than one app function matches "${selector.value}".`,
      hint: 'Select a function with --universal-identifier.',
    });
  }

  const logicFunction = matches[0];
  const identity = {
    applicationUniversalIdentifier,
    functionName: logicFunction.name,
    functionUniversalIdentifier: logicFunction.universalIdentifier,
  };
  onExecuting(logicFunction.name);
  signal.throwIfAborted();
  const executionClient = createMetadataClient({
    target,
    signal,
    timeoutMilliseconds:
      Math.ceil(logicFunction.timeoutSeconds * 1000) +
      REQUEST_TIMEOUT_MILLISECONDS,
  });

  try {
    const { executeOneLogicFunction: result } = await executionClient.mutation({
      executeOneLogicFunction: {
        __args: { input: { id: logicFunction.id, payload } },
        data: true,
        logs: true,
        duration: true,
        status: true,
        error: true,
      },
    });

    if (
      !isPlainObject(result) ||
      !isString(result.status) ||
      !isString(result.logs) ||
      !isNumber(result.duration) ||
      !Number.isFinite(result.duration) ||
      result.duration < 0
    ) {
      throw invalidResponse();
    }

    return {
      ...identity,
      status: result.status,
      durationMilliseconds: result.duration,
      data: result.data ?? null,
      logs: result.logs,
      error: result.error ?? null,
    };
  } catch (error) {
    const cliError = toCliError(error, signal);
    const rejected = wasExecutionRejected(cliError);
    throw new CliError({
      code: cliError.code,
      exitCode: cliError.exitCode,
      message: cliError.message,
      hint: rejected
        ? cliError.hint
        : 'Execution may have started and may still be running. Check its effects before retrying; this command does not retry or stop server-side execution.',
      details: {
        ...cliError.details,
        ...identity,
        outcome: rejected ? 'not-started' : 'unknown',
      },
    });
  }
};

export type AppFunctionExecution = Awaited<
  ReturnType<typeof executeAppFunction>
>;
