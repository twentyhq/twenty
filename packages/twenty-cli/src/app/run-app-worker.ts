import { type WatchInputs } from '@/app/dev/types/watch-inputs.type';
import { fork } from 'node:child_process';

import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { APP_WORKER } from '@/app/constants/app-worker.constant';
import { createAppWorkerEnvironment } from '@/app/create-app-worker-environment';
import { createOutputCollector } from '@/app/create-output-collector';
import { getAppWorkerLaunch } from '@/app/get-app-worker-launch';
import { type AppWorkerOutput } from '@/app/types/app-worker-output.type';
import {
  type AppWorkerRequest,
  type AppWorkerResponse,
} from '@/app/types/app-worker-message.type';
import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';

type HeldBuild = {
  result: unknown;
  watchInputs?: WatchInputs;
  output: AppWorkerOutput;
};

type HeldWorkOutcome =
  | { isSuccessful: true }
  | { isSuccessful: false; error: unknown };

const isWorkerResponse = (value: unknown): value is AppWorkerResponse =>
  isPlainObject(value) &&
  ((value.type === 'result' &&
    'result' in value &&
    (value.isSnapshotHeld === true || value.isSnapshotHeld === false)) ||
    (value.type === 'released' && 'release' in value) ||
    (value.type === 'failure' &&
      isString(value.message) &&
      (!isDefined(value.code) || isString(value.code)) &&
      (!isDefined(value.hint) || isString(value.hint)) &&
      (!isDefined(value.details) || isPlainObject(value.details))));

export const runAppWorker = async ({
  request,
  signal,
  useHeldSnapshot,
}: {
  request: Extract<
    AppWorkerRequest,
    {
      type:
        | 'generateSourceClient'
        | 'readSourceIdentity'
        | 'buildManifest'
        | 'typecheckSource'
        | 'bundleSnapshot'
        | 'pull';
    }
  >;
  signal: AbortSignal;
  useHeldSnapshot?: (heldBuild: HeldBuild) => Promise<void>;
}) => {
  signal.throwIfAborted();

  const { modulePath, execArgv } = getAppWorkerLaunch();
  const worker = fork(modulePath, [], {
    cwd: request.appPath,
    env: createAppWorkerEnvironment(process.env),
    execArgv,
    serialization: 'json',
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  const stdout = createOutputCollector(APP_WORKER.OUTPUT_LIMIT_BYTES);
  const stderr = createOutputCollector(APP_WORKER.OUTPUT_LIMIT_BYTES);

  worker.stdout?.on('data', stdout.add);
  worker.stderr?.on('data', stderr.add);

  return new Promise<{
    result: unknown;
    watchInputs?: WatchInputs;
    release?: unknown;
    isSnapshotHeld: boolean;
    output: AppWorkerOutput;
  }>((resolve, reject) => {
    let resultResponse:
      | Extract<AppWorkerResponse, { type: 'result' }>
      | undefined;
    let failureResponse:
      | Extract<AppWorkerResponse, { type: 'failure' }>
      | undefined;
    let releasedResponse:
      | Extract<AppWorkerResponse, { type: 'released' }>
      | undefined;
    let heldWork: Promise<HeldWorkOutcome> | undefined;
    let killTimer: NodeJS.Timeout | undefined;
    let isSettled = false;

    const readOutput = (): AppWorkerOutput => {
      const standardOutput = stdout.read();
      const standardError = stderr.read();

      return {
        stdout: standardOutput.text,
        stderr: standardError.text,
        isTruncated: standardOutput.isTruncated || standardError.isTruncated,
      };
    };
    const askToStop = (stopRequest: AppWorkerRequest) => {
      if (worker.connected) {
        worker.send(stopRequest);
      }

      killTimer = setTimeout(
        () => worker.kill('SIGKILL'),
        APP_WORKER.CANCEL_GRACE_MILLISECONDS,
      );
    };
    const cancel = () => askToStop({ type: 'cancel' });
    const settle = (settleWith: () => void) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      signal.removeEventListener('abort', cancel);
      clearTimeout(killTimer);
      settleWith();
    };
    const startHeldWork = (
      response: Extract<AppWorkerResponse, { type: 'result' }>,
    ) => {
      signal.removeEventListener('abort', cancel);
      clearTimeout(killTimer);

      const runHeldWork = isDefined(useHeldSnapshot)
        ? useHeldSnapshot({
            result: response.result,
            watchInputs: response.watchInputs,
            output: readOutput(),
          })
        : Promise.resolve();

      heldWork = runHeldWork
        .then(
          (): HeldWorkOutcome => ({ isSuccessful: true }),
          (error: unknown): HeldWorkOutcome => ({
            isSuccessful: false,
            error,
          }),
        )
        .finally(() => askToStop({ type: 'release' }));
    };
    const finish = ({
      exitCode,
      exitSignal,
      heldOutcome,
    }: {
      exitCode: number | null;
      exitSignal: NodeJS.Signals | null;
      heldOutcome?: HeldWorkOutcome;
    }) =>
      settle(() => {
        const output = readOutput();

        if (isDefined(heldOutcome) && !heldOutcome.isSuccessful) {
          reject(heldOutcome.error);

          return;
        }

        if (isDefined(resultResponse)) {
          resolve({
            result: resultResponse.result,
            watchInputs: resultResponse.watchInputs,
            release: resultResponse.isSnapshotHeld
              ? releasedResponse?.release
              : resultResponse.release,
            isSnapshotHeld: resultResponse.isSnapshotHeld,
            output,
          });

          return;
        }

        if (signal.aborted) {
          reject(createCancelledError());

          return;
        }

        const stopReason = isDefined(exitSignal)
          ? `signal ${exitSignal}`
          : `exit code ${exitCode}`;

        reject(
          new CliError({
            code: 'WORKER_FAILED',
            message: isDefined(failureResponse)
              ? `The app worker failed: ${failureResponse.message}`
              : `The app worker stopped before finishing (${stopReason}). App code or a dependency may have exited the process.`,
            hint: failureResponse?.hint,
            details: {
              ...failureResponse?.details,
              workerErrorCode: failureResponse?.code,
              exitCode,
              signal: exitSignal,
              output,
            },
          }),
        );
      });

    signal.addEventListener('abort', cancel, { once: true });

    worker.on('message', (message: unknown) => {
      if (!isWorkerResponse(message)) {
        return;
      }

      if (message.type === 'released') {
        releasedResponse = message;

        return;
      }

      if (message.type === 'failure') {
        failureResponse = message;

        return;
      }

      resultResponse = message;

      if (message.isSnapshotHeld) {
        startHeldWork(message);
      }
    });

    worker.on('error', (error) =>
      settle(() =>
        reject(
          new CliError({
            code: 'WORKER_FAILED',
            message: `The app worker could not run: ${error.message}`,
          }),
        ),
      ),
    );

    worker.on('close', (exitCode, exitSignal) => {
      if (!isDefined(heldWork)) {
        finish({ exitCode, exitSignal });

        return;
      }

      heldWork
        .then((heldOutcome) => finish({ exitCode, exitSignal, heldOutcome }))
        .catch((error: unknown) => settle(() => reject(error)));
    });

    worker.send(request);
  });
};
