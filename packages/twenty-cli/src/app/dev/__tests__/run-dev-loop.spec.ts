import { describe, expect, it, vi } from 'vitest';

import { runDevLoop, type DevSnapshot } from '@/app/dev/run-dev-loop';

const deferred = <TValue>() => Promise.withResolvers<TValue>();
const snapshot = (contentHash: string) => ({
  contentHash,
  release: vi.fn(async () => {}),
});

describe('dev scheduling', () => {
  it('coalesces behind a slow sync, keeps its snapshot alive, compares with the last acknowledgement', async () => {
    const controller = new AbortController();
    const firstSync = deferred<boolean>();
    const snapshots = [
      snapshot('A'),
      snapshot('B'),
      snapshot('C'),
      snapshot('C'),
    ];
    const apply = vi.fn(async (_snapshot: DevSnapshot) =>
      apply.mock.calls.length === 1 ? firstSync.promise : true,
    );
    const build = vi.fn(async () => snapshots[build.mock.calls.length - 1]);
    const skipped = vi.fn(async () => {});
    let invalidate = () => {};
    const close = vi.fn(async () => {});
    const session = runDevLoop({
      signal: controller.signal,
      subscribe: async (change) => {
        invalidate = change;
        return close;
      },
      build,
      apply,
      onSkipped: skipped,
      debounceMilliseconds: 0,
    }).catch((error: unknown) => error);

    await vi.waitFor(() => expect(apply).toHaveBeenCalledTimes(1));
    invalidate();
    await vi.waitFor(() => expect(build).toHaveBeenCalledTimes(2));
    invalidate();
    await vi.waitFor(() => expect(build).toHaveBeenCalledTimes(3));
    expect(apply).toHaveBeenCalledTimes(1);
    expect(snapshots[0].release).not.toHaveBeenCalled();
    expect(snapshots[1].release).toHaveBeenCalledTimes(1);
    firstSync.resolve(true);
    await vi.waitFor(() => expect(apply).toHaveBeenCalledTimes(2));
    expect(apply.mock.calls[1][0].contentHash).toBe('C');
    invalidate();
    await vi.waitFor(() =>
      expect(skipped).toHaveBeenCalledWith(4, 'unchanged'),
    );
    expect(apply).toHaveBeenCalledTimes(2);
    controller.abort();
    await session;
    for (const retained of snapshots)
      expect(retained.release).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('never syncs a build superseded by an invalid revision and recovers on a later edit', async () => {
    const controller = new AbortController();
    const firstBuild = deferred<DevSnapshot>();
    const obsolete = snapshot('obsolete');
    const fixed = snapshot('fixed');
    const build = vi
      .fn<
        (_: number, signal: AbortSignal) => Promise<DevSnapshot | undefined>
      >()
      .mockImplementationOnce(() => firstBuild.promise)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(fixed);
    const apply = vi.fn(async () => true);
    let invalidate = () => {};
    const session = runDevLoop({
      signal: controller.signal,
      subscribe: async (change) => {
        invalidate = change;
        return async () => {};
      },
      build,
      apply,
      onSkipped: async () => {},
      debounceMilliseconds: 0,
    }).catch((error: unknown) => error);

    await vi.waitFor(() => expect(build).toHaveBeenCalledTimes(1));
    invalidate();
    firstBuild.resolve(obsolete);
    await vi.waitFor(() => expect(build).toHaveBeenCalledTimes(2));
    expect(apply).not.toHaveBeenCalled();
    expect(obsolete.release).toHaveBeenCalledOnce();
    invalidate();
    await vi.waitFor(() => expect(apply).toHaveBeenCalledOnce());
    controller.abort();
    await session;
    expect(fixed.release).toHaveBeenCalledOnce();
  });

  it('quiesces compilation before client writes, then rebuilds explicitly without another sync', async () => {
    const controller = new AbortController();
    const secondBuild = deferred<DevSnapshot>();
    const startGeneration = deferred<void>();
    const thirdBuild = snapshot('A');
    const built = [snapshot('A'), snapshot('B')];
    let invalidate = () => {};
    let generationStarted = false;
    const build = vi.fn(async () => {
      if (build.mock.calls.length === 2) return secondBuild.promise;
      return build.mock.calls.length === 1 ? built[0] : thirdBuild;
    });
    const skipped = vi.fn(async () => {});
    const session = runDevLoop({
      signal: controller.signal,
      subscribe: async (change) => {
        invalidate = change;
        return async () => {};
      },
      build,
      apply: async (_snapshot, controls) => {
        await startGeneration.promise;
        await controls.withBuildsPaused(async () => {
          generationStarted = true;
          controls.invalidate();
        });
        return true;
      },
      onSkipped: skipped,
      debounceMilliseconds: 0,
    }).catch((error: unknown) => error);

    await vi.waitFor(() => expect(build).toHaveBeenCalledOnce());
    invalidate();
    await vi.waitFor(() => expect(build).toHaveBeenCalledTimes(2));
    startGeneration.resolve();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(generationStarted).toBe(false);
    secondBuild.resolve(built[1]);
    await vi.waitFor(() =>
      expect(skipped).toHaveBeenCalledWith(3, 'unchanged'),
    );
    expect(generationStarted).toBe(true);
    controller.abort();
    await session;
    for (const retained of [...built, thirdBuild])
      expect(retained.release).toHaveBeenCalledOnce();
  });

  it('invalidates pending approvals but lets an active sync settle before releasing its files', async () => {
    const controller = new AbortController();
    const retained = snapshot('A');
    const settled = deferred<boolean>();
    let invalidate = () => {};
    let approvalSignal: AbortSignal | undefined;
    const apply = vi.fn(async (_snapshot, controls) => {
      approvalSignal = controls.revisionSignal;
      return settled.promise;
    });
    const session = runDevLoop({
      signal: controller.signal,
      subscribe: async (change) => {
        invalidate = change;
        return async () => {};
      },
      build: async (revision) => (revision === 1 ? retained : undefined),
      apply,
      onSkipped: async () => {},
      debounceMilliseconds: 0,
    }).catch((error: unknown) => error);

    await vi.waitFor(() => expect(apply).toHaveBeenCalledOnce());
    invalidate();
    expect(approvalSignal?.aborted).toBe(true);
    controller.abort();
    expect(retained.release).not.toHaveBeenCalled();
    settled.resolve(true);
    await session;
    expect(retained.release).toHaveBeenCalledOnce();
  });

  it('aborts active compilation when the watcher fails', async () => {
    const fatal = new Error('watch failed');
    const controller = new AbortController();
    let fail = (_error: unknown) => {};
    const build = vi.fn(
      async (
        _revision,
        signal: AbortSignal,
      ): Promise<DevSnapshot | undefined> =>
        new Promise((_, reject) =>
          signal.addEventListener('abort', () => reject(signal.reason), {
            once: true,
          }),
        ),
    );
    const session = runDevLoop({
      signal: controller.signal,
      subscribe: async (_change, failed) => {
        fail = failed;
        return async () => {};
      },
      build,
      apply: async () => true,
      onSkipped: async () => {},
      debounceMilliseconds: 0,
    });
    const result = expect(session).rejects.toBe(fatal);

    await vi.waitFor(() => expect(build).toHaveBeenCalledOnce());
    fail(fatal);
    await result;
  });
});
