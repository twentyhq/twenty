import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import type {
  AppWorkerRequest,
  AppWorkerResponse,
} from '@/app/types/app-worker-message.type';

type SnapshotApi = {
  buildSourceSnapshot: (options: {
    appPath: string;
    signal: AbortSignal;
  }) => Promise<unknown>;
  releaseSourceSnapshot: (options: { buildId: string }) => Promise<unknown>;
};

type HeldSnapshot = {
  snapshotApi: SnapshotApi;
  buildId: string;
};

const PARENT_DISCONNECT_EXIT_MILLISECONDS = 5000;

const abortController = new AbortController();

let heldSnapshot: HeldSnapshot | undefined;

const parseRequest = (message: unknown): AppWorkerRequest | undefined => {
  if (!isPlainObject(message)) {
    return undefined;
  }

  if (message.type === 'cancel' || message.type === 'release') {
    return { type: message.type };
  }

  if (
    message.type === 'readSourceIdentity' ||
    message.type === 'buildManifest' ||
    message.type === 'typecheckSource'
  ) {
    return isNonEmptyString(message.appPath)
      ? { type: message.type, appPath: message.appPath }
      : undefined;
  }

  if (message.type === 'bundleSnapshot') {
    return isNonEmptyString(message.appPath)
      ? {
          type: 'bundleSnapshot',
          collectWatchInputs: message.collectWatchInputs === true,
          appPath: message.appPath,
          holdSnapshot: message.holdSnapshot === true,
        }
      : undefined;
  }

  if (message.type === 'pull') {
    if (
      !isNonEmptyString(message.appPath) ||
      !isPlainObject(message.target) ||
      !isNonEmptyString(message.target.apiUrl) ||
      !isNonEmptyString(message.target.workspaceId) ||
      !isPlainObject(message.applicationExport) ||
      !isPlainObject(message.applicationExport.application) ||
      !isNonEmptyString(
        message.applicationExport.application.universalIdentifier,
      )
    ) {
      return undefined;
    }
    return {
      type: 'pull',
      appPath: message.appPath,
      target: {
        apiUrl: message.target.apiUrl,
        workspaceId: message.target.workspaceId,
      },
      applicationExport: message.applicationExport,
    };
  }

  if (message.type === 'generateSourceClient') {
    return isNonEmptyString(message.appPath) && isString(message.schema)
      ? {
          type: 'generateSourceClient',
          appPath: message.appPath,
          schema: message.schema,
        }
      : undefined;
  }

  return undefined;
};

const respond = (response: AppWorkerResponse) => {
  if (!process.connected) {
    process.exit(1);
  }

  process.send?.(response, undefined, {}, () => process.exit(0));
};

const releaseHeldSnapshot = async () => {
  if (!isDefined(heldSnapshot)) {
    return null;
  }

  const { snapshotApi, buildId } = heldSnapshot;

  heldSnapshot = undefined;

  return snapshotApi.releaseSourceSnapshot({ buildId });
};

const exitAfterReleasing = () => {
  void releaseHeldSnapshot().then(
    () => process.exit(1),
    () => process.exit(1),
  );
};

const sendHeldResult = (response: AppWorkerResponse) => {
  if (!process.connected) {
    exitAfterReleasing();

    return;
  }

  process.send?.(response);
};

const readSuccessfulBuildId = (result: unknown) => {
  if (
    !isPlainObject(result) ||
    result.success !== true ||
    !isPlainObject(result.data)
  ) {
    return undefined;
  }

  return isNonEmptyString(result.data.buildId)
    ? result.data.buildId
    : undefined;
};

const runSnapshotBuild = async ({
  snapshotApi,
  appPath,
  holdSnapshot,
}: {
  snapshotApi: SnapshotApi;
  appPath: string;
  holdSnapshot: boolean;
}): Promise<AppWorkerResponse> => {
  const signal = abortController.signal;
  const result = await snapshotApi.buildSourceSnapshot({ appPath, signal });
  const buildId = readSuccessfulBuildId(result);

  if (!isDefined(buildId)) {
    return { type: 'result', result, isSnapshotHeld: false };
  }

  if (holdSnapshot) {
    heldSnapshot = { snapshotApi, buildId };

    return { type: 'result', result, isSnapshotHeld: true };
  }

  return {
    type: 'result',
    result,
    release: await snapshotApi.releaseSourceSnapshot({ buildId }),
    isSnapshotHeld: false,
  };
};

const toFailure = (error: unknown): AppWorkerResponse => ({
  type: 'failure',
  message: error instanceof Error ? error.message : String(error),
  ...(error instanceof Error && 'code' in error && isString(error.code)
    ? { code: error.code }
    : {}),
  ...(error instanceof Error && 'hint' in error && isString(error.hint)
    ? { hint: error.hint }
    : {}),
  ...(error instanceof Error &&
  'details' in error &&
  isPlainObject(error.details)
    ? { details: error.details }
    : {}),
});

process.on('SIGINT', () => undefined);

process.on('disconnect', () => {
  abortController.abort();
  setTimeout(() => process.exit(1), PARENT_DISCONNECT_EXIT_MILLISECONDS);

  if (isDefined(heldSnapshot)) {
    exitAfterReleasing();
  }
});

process.on('message', (message: unknown) => {
  const request = parseRequest(message);

  if (!isDefined(request)) {
    respond({
      type: 'failure',
      message: 'The app worker received a request it cannot read.',
    });

    return;
  }

  if (request.type === 'cancel') {
    abortController.abort();

    return;
  }

  if (request.type === 'release') {
    releaseHeldSnapshot().then(
      (release) => respond({ type: 'released', release }),
      (error: unknown) => respond(toFailure(error)),
    );

    return;
  }

  if (request.type === 'pull') {
    import('@/app/worker/pull-source')
      .then(async ({ pullSource }) => {
        const result = await pullSource({
          ...request,
          signal: abortController.signal,
        });
        respond({ type: 'result', result, isSnapshotHeld: false });
      })
      .catch((error: unknown) => respond(toFailure(error)));
    return;
  }

  if (request.type === 'bundleSnapshot') {
    import('@/app/worker/build-source-snapshot')
      .then(async ({ buildSourceSnapshot, releaseSourceSnapshot }) => {
        const run = () =>
          runSnapshotBuild({
            snapshotApi: {
              buildSourceSnapshot,
              releaseSourceSnapshot,
            },
            appPath: request.appPath,
            holdSnapshot: request.holdSnapshot,
          });

        if (!request.collectWatchInputs) {
          return run();
        }

        const { collectWatchInputs } =
          await import('@/app/dev/collect-watch-inputs');
        const { recordTypecheckConfigInputs } =
          await import('@/app/dev/record-typecheck-config-inputs');
        const collected = await collectWatchInputs(async () => {
          await recordTypecheckConfigInputs(request.appPath);

          return run();
        });

        return { ...collected.result, watchInputs: collected.watchInputs };
      })
      .then(
        (response) =>
          response.type === 'result' && response.isSnapshotHeld
            ? sendHeldResult(response)
            : respond(response),
        (error: unknown) => respond(toFailure(error)),
      );

    return;
  }

  if (request.type === 'typecheckSource') {
    import('@/app/typecheck/typecheck-application')
      .then(async ({ typecheckApplication }) => {
        const result = await typecheckApplication({
          appPath: request.appPath,
          signal: abortController.signal,
        });

        respond({ type: 'result', result, isSnapshotHeld: false });
      })
      .catch((error: unknown) => respond(toFailure(error)));

    return;
  }

  if (request.type === 'buildManifest') {
    import('@/app/worker/build-source-manifest')
      .then(async ({ buildSourceManifest }) => {
        const result = await buildSourceManifest({
          appPath: request.appPath,
          signal: abortController.signal,
        });

        respond({ type: 'result', result, isSnapshotHeld: false });
      })
      .catch((error: unknown) => respond(toFailure(error)));

    return;
  }

  if (request.type === 'readSourceIdentity') {
    import('@/app/worker/read-source-identity')
      .then(async ({ readSourceIdentity }) => {
        const result = await readSourceIdentity({
          appPath: request.appPath,
          signal: abortController.signal,
        });

        respond({ type: 'result', result, isSnapshotHeld: false });
      })
      .catch((error: unknown) => respond(toFailure(error)));

    return;
  }

  if (request.type === 'generateSourceClient') {
    import('@/app/client/generate-application-client')
      .then(async ({ generateApplicationClient }) => {
        const result = await generateApplicationClient({
          appPath: request.appPath,
          schema: request.schema,
          signal: abortController.signal,
        });

        respond({ type: 'result', result, isSnapshotHeld: false });
      })
      .catch((error: unknown) => respond(toFailure(error)));

    return;
  }
});
