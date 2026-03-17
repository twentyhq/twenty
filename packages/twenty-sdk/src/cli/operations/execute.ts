import { ApiService } from '@/cli/utilities/api/api-service';
import { readManifestFromFile } from '@/cli/utilities/build/manifest/manifest-reader';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { type Manifest } from 'twenty-shared/application';
import { runSafe } from '@/cli/utilities/run-safe';
import {
  APP_ERROR_CODES,
  FUNCTION_ERROR_CODES,
  type CommandResult,
  type FunctionExecutionResult,
} from '@/cli/types';

export type FunctionExecuteOptions = {
  appPath: string;
  remote?: string;
  payload?: Record<string, unknown>;
} & (
  | { postInstall: true }
  | { functionUniversalIdentifier: string }
  | { functionName: string }
);

type LogicFunction = {
  id: string;
  name: string;
  universalIdentifier: string;
  applicationId: string | null;
};

const belongsToApplication = (
  logicFunction: LogicFunction,
  manifest: Manifest,
): boolean => {
  return manifest.logicFunctions.some(
    (manifestFn) =>
      manifestFn.universalIdentifier === logicFunction.universalIdentifier,
  );
};

const resolveIdentifier = (options: FunctionExecuteOptions): string => {
  if ('postInstall' in options) return 'post install';
  if ('functionUniversalIdentifier' in options)
    return options.functionUniversalIdentifier;
  if ('functionName' in options) return options.functionName;

  return 'unknown';
};

const innerFunctionExecute = async (
  options: FunctionExecuteOptions,
): Promise<CommandResult<FunctionExecutionResult>> => {
  if (options.remote) {
    ConfigService.setActiveRemote(options.remote);
  }

  const apiService = new ApiService();
  const manifest = await readManifestFromFile(options.appPath);

  if (!manifest) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_NOT_FOUND,
        message: 'Manifest not found. Run `build` or `dev` first.',
      },
    };
  }

  const functionsResult = await apiService.findLogicFunctions();

  if (!functionsResult.success) {
    const errorMessage =
      functionsResult.error instanceof Error
        ? functionsResult.error.message
        : String(functionsResult.error ?? 'Failed to fetch functions');

    return {
      success: false,
      error: {
        code: FUNCTION_ERROR_CODES.FETCH_FUNCTIONS_FAILED,
        message: errorMessage,
      },
    };
  }

  const appFunctions = functionsResult.data.filter(
    (logicFunction) =>
      logicFunction.universalIdentifier &&
      belongsToApplication(logicFunction, manifest),
  );

  const targetFunction = appFunctions.find((logicFunction) => {
    if ('postInstall' in options && options.postInstall) {
      return (
        logicFunction.universalIdentifier ===
        manifest.application.postInstallLogicFunctionUniversalIdentifier
      );
    }
    if ('functionUniversalIdentifier' in options) {
      return (
        logicFunction.universalIdentifier ===
        options.functionUniversalIdentifier
      );
    }
    if ('functionName' in options) {
      return logicFunction.name === options.functionName;
    }

    return false;
  });

  if (!targetFunction) {
    return {
      success: false,
      error: {
        code: FUNCTION_ERROR_CODES.FUNCTION_NOT_FOUND,
        message: `Function "${resolveIdentifier(options)}" not found in application.`,
        details: {
          identifier: resolveIdentifier(options),
          availableFunctions: appFunctions.map((logicFunction) => ({
            name: logicFunction.name,
            universalIdentifier: logicFunction.universalIdentifier,
          })),
        },
      },
    };
  }

  const result = await apiService.executeLogicFunction({
    functionId: targetFunction.id,
    payload: options.payload ?? {},
  });

  if (!result.success) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : String(result.error ?? 'Execution failed');

    return {
      success: false,
      error: {
        code: FUNCTION_ERROR_CODES.EXECUTION_FAILED,
        message: errorMessage,
      },
    };
  }

  return {
    success: true,
    data: {
      functionName: targetFunction.name,
      ...result.data!,
    },
  };
};

export const functionExecute = (
  options: FunctionExecuteOptions,
): Promise<CommandResult<FunctionExecutionResult>> =>
  runSafe(
    () => innerFunctionExecute(options),
    FUNCTION_ERROR_CODES.EXECUTION_FAILED,
  );
