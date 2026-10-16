import { isNull, isString } from '@sniptt/guards';
import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isPlainObject } from 'twenty-shared/utils';

import { parseToolingResult } from '@/app/parse-tooling-result';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { runAppWorker } from '@/app/run-app-worker';
import { type AppSourceIdentity } from '@/app/source/types/app-source-identity.type';
import { toWorkerOutputDiagnostics } from '@/app/to-worker-output-diagnostics';
import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';
import { type CliWarning } from '@/output/types/cli-warning.type';

const parseIdentity = (
  value: unknown,
): { data: AppSourceIdentity } | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  if (isNull(value.application)) {
    return { data: { application: null } };
  }

  const application = value.application;

  if (
    !isPlainObject(application) ||
    !isString(application.universalIdentifier) ||
    !isValidUniversalIdentifier(application.universalIdentifier) ||
    (!isString(application.displayName) && !isNull(application.displayName))
  ) {
    return undefined;
  }

  return {
    data: {
      application: {
        universalIdentifier: application.universalIdentifier,
        displayName: application.displayName,
      },
    },
  };
};

export const readAppIdentity = async ({
  appPath,
  signal,
  warn,
}: {
  appPath: string;
  signal: AbortSignal;
  warn?: (warning: CliWarning) => void;
}) => {
  signal.throwIfAborted();

  const sdk = await resolveSourceSdk({ appPath, warn });
  const worker = await runAppWorker({
    request: { type: 'readSourceIdentity', appPath },
    signal,
  });

  if (signal.aborted) {
    throw createCancelledError();
  }

  const result = parseToolingResult({
    value: worker.result,
    parseData: parseIdentity,
  });
  const diagnostics = [
    ...result.diagnostics,
    ...toWorkerOutputDiagnostics(worker.output),
  ];

  if (!result.success) {
    throw new CliError({
      code:
        result.error.code === 'SDK_SOURCE_UNSUPPORTED'
          ? 'SDK_SOURCE_UNSUPPORTED'
          : 'IDENTITY_READ_FAILED',
      message: result.error.message,
      hint:
        result.error.hint ??
        (result.error.code === 'SDK_SOURCE_UNSUPPORTED'
          ? 'Use the SDK define functions, rename local helpers with the same names, or install a compatible twenty-sdk version.'
          : undefined),
      details: {
        ...result.error.details,
        sdkVersion: sdk.version,
        diagnostics,
      },
    });
  }

  return { ...result.data, diagnostics };
};
