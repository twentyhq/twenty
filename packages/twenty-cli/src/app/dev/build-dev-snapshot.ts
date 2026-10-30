import { isDefined } from 'twenty-shared/utils';

import { createToolingFailure } from '@/app/create-tooling-failure';
import { retainDevSnapshot } from '@/app/dev/retain-dev-snapshot';
import { type WatchInputs } from '@/app/dev/types/watch-inputs.type';
import { parseBuildData, parseToolingResult } from '@/app/parse-tooling-result';
import { collectSourceFingerprints } from '@/app/pull/collect-source-fingerprints';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { runAppWorker } from '@/app/run-app-worker';
import { toWorkerOutputDiagnostics } from '@/app/to-worker-output-diagnostics';
import { CliError } from '@/output/cli-error';
import { type CliWarning } from '@/output/types/cli-warning.type';

export const buildDevSnapshot = async ({
  appPath,
  signal,
  updateWatchInputs,
  warn,
}: {
  appPath: string;
  signal: AbortSignal;
  updateWatchInputs: (inputs: WatchInputs, success: boolean) => Promise<void>;
  warn?: (warning: CliWarning) => void;
}) => {
  const tooling = await resolveSourceSdk({
    appPath,
    warn,
  });
  const sourceFingerprints = await collectSourceFingerprints(appPath).catch(
    () => undefined,
  );
  let retained: Awaited<ReturnType<typeof retainDevSnapshot>> | undefined;

  try {
    const workerRun = await runAppWorker({
      request: {
        type: 'bundleSnapshot',
        appPath,
        holdSnapshot: true,
        collectWatchInputs: true,
      },
      signal,
      useHeldSnapshot: async ({ result }) => {
        const parsed = parseToolingResult({
          value: result,
          parseData: parseBuildData,
        });

        if (parsed.success) {
          retained = await retainDevSnapshot({
            build: parsed.data,
            appPath,
            signal,
          });
        }
      },
    });
    signal.throwIfAborted();
    const result = parseToolingResult({
      value: workerRun.result,
      parseData: parseBuildData,
    });
    const diagnostics = [
      ...result.diagnostics,
      ...toWorkerOutputDiagnostics(workerRun.output),
    ];

    await updateWatchInputs(workerRun.watchInputs ?? [], result.success);

    if (!result.success) {
      throw createToolingFailure({
        error: result.error,
        diagnostics,
        sdkVersion: tooling.version,
      });
    }

    if (!isDefined(retained)) {
      throw new CliError({
        code: 'WORKER_FAILED',
        message: 'The build worker did not retain its dev snapshot.',
      });
    }

    const releaseResult = workerRun.release;

    if (
      !isDefined(releaseResult) ||
      !parseToolingResult({
        value: releaseResult,
        parseData: (value) => (value === null ? { data: null } : undefined),
      }).success
    ) {
      throw new CliError({
        code: 'WORKER_FAILED',
        message:
          'The build worker could not release its source snapshot. Stop and clean up .twenty/cli/snapshots before restarting dev.',
      });
    }

    return {
      ...retained,
      contentHash: retained.build.contentHash,
      tooling,
      diagnostics,
      sourceFingerprints,
    };
  } catch (error) {
    await retained?.release();

    throw error;
  }
};

export type BuiltDevSnapshot = Awaited<ReturnType<typeof buildDevSnapshot>>;
