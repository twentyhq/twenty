import { isNonEmptyString } from '@sniptt/guards';

import { createToolingFailure } from '@/app/create-tooling-failure';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { parseNullData, parseToolingResult } from '@/app/parse-tooling-result';
import { runAppWorker } from '@/app/run-app-worker';
import { toWorkerOutputDiagnostics } from '@/app/to-worker-output-diagnostics';
import { type ProjectSdk } from '@/app/project/types/project-sdk.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const fetchAppClientSchema = async ({
  applicationUniversalIdentifier,
  context: { target, signal, output },
}: {
  applicationUniversalIdentifier: string;
  context: TargetCommandContext;
}) => {
  output.progress('Fetching the application schema…');

  const data = await createMetadataClient({ target, signal }).query({
    __name: 'ApplicationCoreGraphqlSchema',
    applicationCoreGraphqlSchema: {
      __args: { applicationUniversalIdentifier },
    },
  });
  const schema = data?.applicationCoreGraphqlSchema;

  if (!isNonEmptyString(schema) || schema.trim().length === 0) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server did not return an application GraphQL schema.',
    });
  }

  return schema;
};

export const generateAppClientFromSchema = async ({
  appPath,
  schema,
  sdk,
  context: { signal, output, outputMode },
}: {
  appPath: string;
  schema: string;
  sdk: ProjectSdk;
  context: TargetCommandContext;
}) => {
  output.progress('Generating the typed API client…');

  const workerRun = await runAppWorker({
    request: { type: 'generateSourceClient', appPath, schema },
    signal,
  });
  const result = parseToolingResult({
    value: workerRun.result,
    parseData: parseNullData,
  });
  const diagnostics = [
    ...result.diagnostics,
    ...toWorkerOutputDiagnostics(workerRun.output),
  ];

  if (outputMode === 'human') {
    for (const diagnostic of diagnostics) {
      output.progress(formatToolingDiagnostic(diagnostic));
    }
  }

  if (!result.success) {
    throw createToolingFailure({
      error: result.error,
      diagnostics,
      sdkVersion: sdk.version,
      operation: 'generateClient',
    });
  }

  signal.throwIfAborted();

  return diagnostics;
};

export const generateAppClient = async (options: {
  appPath: string;
  applicationUniversalIdentifier: string;
  sdk: ProjectSdk;
  context: TargetCommandContext;
}) =>
  generateAppClientFromSchema({
    ...options,
    schema: await fetchAppClientSchema(options),
  });
