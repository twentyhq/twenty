import { setTimeout } from 'node:timers/promises';

import { isDefined } from 'twenty-shared/utils';

export type DevSnapshot = {
  contentHash: string;
  release: () => Promise<void>;
};

export const runDevLoop = async <TSnapshot extends DevSnapshot>({
  signal,
  subscribe,
  build,
  apply,
  onSkipped,
  debounceMilliseconds = 100,
}: {
  signal: AbortSignal;
  subscribe: (
    invalidate: () => void,
    fail: (error: unknown) => void,
  ) => Promise<() => Promise<void>>;
  build: (
    revision: number,
    signal: AbortSignal,
  ) => Promise<TSnapshot | undefined>;
  apply: (
    snapshot: TSnapshot,
    controls: {
      revision: number;
      signal: AbortSignal;
      revisionSignal: AbortSignal;
      withBuildsPaused: <TResult>(
        run: () => Promise<TResult>,
      ) => Promise<TResult>;
      invalidate: () => void;
    },
  ) => Promise<boolean>;
  onSkipped: (
    revision: number,
    reason: 'superseded' | 'unchanged',
  ) => Promise<void>;
  debounceMilliseconds?: number;
}) => {
  const stopped = new AbortController();
  let terminalError: unknown;
  const stop = (error: unknown) => {
    stopped.abort(error);
    wake();
  };
  const interrupted = () => stop(signal.reason);
  const waiters = new Set<() => void>();
  const wake = () => {
    for (const waiter of waiters) {
      waiter();
    }
  };
  const waitFor = async (predicate: () => boolean) => {
    while (!predicate()) {
      stopped.signal.throwIfAborted();
      await new Promise<void>((resolve) => {
        const waiter = () => {
          waiters.delete(waiter);
          resolve();
        };

        waiters.add(waiter);
      });
    }

    stopped.signal.throwIfAborted();
  };
  let revision = 1;
  let attemptedRevision = 0;
  let pending: { snapshot: TSnapshot; revision: number } | undefined;
  let isBuilding = false;
  let areBuildsPaused = false;
  let approval = new AbortController();
  let acknowledgedHash: string | undefined;
  const invalidate = () => {
    revision += 1;
    approval.abort(new Error('App changed while awaiting approval.'));
    wake();
  };
  const buildLoop = async () => {
    while (!stopped.signal.aborted) {
      await waitFor(() => !areBuildsPaused && revision !== attemptedRevision);
      const nextRevision = revision;

      await setTimeout(debounceMilliseconds, undefined, {
        signal: stopped.signal,
      });

      if (nextRevision !== revision || areBuildsPaused) {
        continue;
      }

      attemptedRevision = nextRevision;
      isBuilding = true;
      let snapshot: TSnapshot | undefined;

      try {
        if (isDefined(pending)) {
          await pending.snapshot.release();
          pending = undefined;
        }

        snapshot = await build(
          nextRevision,
          AbortSignal.any([signal, stopped.signal]),
        );

        if (isDefined(snapshot)) {
          if (nextRevision !== revision || stopped.signal.aborted) {
            await snapshot.release();
            await onSkipped(nextRevision, 'superseded');
          } else {
            pending = { snapshot, revision: nextRevision };
          }
        }
      } finally {
        isBuilding = false;
        wake();
      }
    }
  };
  const applyLoop = async () => {
    while (!stopped.signal.aborted) {
      await waitFor(() => isDefined(pending) && pending.revision === revision);
      const ready = pending;

      if (!isDefined(ready)) {
        continue;
      }

      pending = undefined;
      approval = new AbortController();

      try {
        if (ready.snapshot.contentHash === acknowledgedHash) {
          await onSkipped(ready.revision, 'unchanged');

          continue;
        }

        const applied = await apply(ready.snapshot, {
          revision: ready.revision,
          signal: AbortSignal.any([signal, stopped.signal]),
          revisionSignal: AbortSignal.any([
            signal,
            stopped.signal,
            approval.signal,
          ]),
          invalidate,
          withBuildsPaused: async (run) => {
            areBuildsPaused = true;

            try {
              await waitFor(() => !isBuilding);

              return await run();
            } finally {
              areBuildsPaused = false;
              wake();
            }
          },
        });

        acknowledgedHash = applied ? ready.snapshot.contentHash : undefined;
      } finally {
        await ready.snapshot.release();
      }
    }
  };

  signal.addEventListener('abort', interrupted, { once: true });
  let unsubscribe: (() => Promise<void>) | undefined;

  try {
    signal.throwIfAborted();
    unsubscribe = await subscribe(invalidate, stop);
    const tasks = [
      buildLoop().catch((error: unknown) => {
        if (!signal.aborted && !isDefined(terminalError)) terminalError = error;
        stop(error);
      }),
      applyLoop().catch((error: unknown) => {
        terminalError = error;
        stop(error);
      }),
    ];

    await Promise.all(tasks);
    if (isDefined(terminalError)) throw terminalError;
    stopped.signal.throwIfAborted();
  } finally {
    stop(signal.reason);
    signal.removeEventListener('abort', interrupted);
    try {
      await unsubscribe?.();
    } finally {
      await pending?.snapshot.release();
    }
  }
};
