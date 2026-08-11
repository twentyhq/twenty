import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileFolder } from 'twenty-shared/types';

import { EsbuildWatcher } from '@/cli/utilities/build/common/esbuild-watcher';
import { FrontComponentsWatcher } from '@/cli/utilities/build/common/front-component-build/front-components-watcher';
import { buildSharedDependenciesBundle } from '@/cli/utilities/build/common/shared-dependencies-build/build-shared-dependencies-bundle';

vi.mock(
  '@/cli/utilities/build/common/shared-dependencies-build/build-shared-dependencies-bundle',
  () => ({
    buildSharedDependenciesBundle: vi.fn(),
  }),
);

vi.mock('@/cli/utilities/file/fs-utils', () => ({
  pathExists: vi.fn(async () => false),
}));

vi.mock('@/cli/utilities/build/common/esbuild-watcher', () => ({
  EsbuildWatcher: vi.fn(),
}));

const SHARED_DEPENDENCIES_MANIFEST = {
  dependencies: ['react'],
  sourcePath: 'src/sharedDependencies.ts',
  builtPath: 'src/sharedDependencies.mjs',
  builtChecksum: null,
};

const SOURCE_PATHS = ['src/my.front-component.tsx'];

const buildSharedDependenciesBundleMock = vi.mocked(
  buildSharedDependenciesBundle,
);
const esbuildWatcherMock = vi.mocked(EsbuildWatcher);

const createComponentsWatcherInstance = () => ({
  start: vi.fn(async () => {}),
  restart: vi.fn(async () => {}),
  close: vi.fn(async () => {}),
  shouldRestart: vi.fn(() => false),
});

let componentsWatcherInstance: ReturnType<
  typeof createComponentsWatcherInstance
>;

const mockSharedDependenciesBuildWithChecksum = (checksum: string) => {
  buildSharedDependenciesBundleMock.mockImplementation(
    async ({ onFileBuilt }) => {
      await onFileBuilt?.({
        fileFolder: FileFolder.BuiltFrontComponent,
        builtPath: 'src/sharedDependencies.mjs',
        sourcePath: 'src/sharedDependencies.ts',
        checksum,
      });

      return { exportNamesBySpecifier: new Map() };
    },
  );
};

const createWatcher = (
  sharedDependencies?: typeof SHARED_DEPENDENCIES_MANIFEST,
) =>
  new FrontComponentsWatcher({
    appPath: '/app',
    sourcePaths: SOURCE_PATHS,
    sharedDependencies,
    shouldSkipTypecheck: () => true,
    handleFileBuilt: vi.fn(),
    handleBuildError: vi.fn(),
  });

const triggerSharedDependenciesBuild = (
  watcher: FrontComponentsWatcher,
): Promise<void> =>
  (
    watcher as unknown as {
      requestSharedDependenciesBuild: () => Promise<void>;
    }
  ).requestSharedDependenciesBuild();

describe('FrontComponentsWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    componentsWatcherInstance = createComponentsWatcherInstance();
    esbuildWatcherMock.mockImplementation(function () {
      return componentsWatcherInstance as unknown as EsbuildWatcher;
    });
    mockSharedDependenciesBuildWithChecksum('checksum-1');
  });

  it('builds the sharedDependencies before starting the component builds, without a restart', async () => {
    const watcher = createWatcher(SHARED_DEPENDENCIES_MANIFEST);

    await watcher.start();

    expect(buildSharedDependenciesBundleMock).toHaveBeenCalledTimes(1);
    expect(componentsWatcherInstance.start).toHaveBeenCalledTimes(1);
    expect(
      buildSharedDependenciesBundleMock.mock.invocationCallOrder[0],
    ).toBeLessThan(componentsWatcherInstance.start.mock.invocationCallOrder[0]);
    expect(componentsWatcherInstance.restart).not.toHaveBeenCalled();
  });

  it('never runs two sharedDependencies builds at the same time', async () => {
    let concurrentBuildCount = 0;
    let maxConcurrentBuildCount = 0;

    buildSharedDependenciesBundleMock.mockImplementation(async () => {
      concurrentBuildCount += 1;
      maxConcurrentBuildCount = Math.max(
        maxConcurrentBuildCount,
        concurrentBuildCount,
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      concurrentBuildCount -= 1;

      return { exportNamesBySpecifier: new Map() };
    });

    const watcher = createWatcher(SHARED_DEPENDENCIES_MANIFEST);

    await Promise.all([
      triggerSharedDependenciesBuild(watcher),
      triggerSharedDependenciesBuild(watcher),
      triggerSharedDependenciesBuild(watcher),
    ]);

    expect(maxConcurrentBuildCount).toBe(1);
  });

  it('runs one queued build after the in flight one instead of one per request', async () => {
    buildSharedDependenciesBundleMock.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      return { exportNamesBySpecifier: new Map() };
    });

    const watcher = createWatcher(SHARED_DEPENDENCIES_MANIFEST);

    await Promise.all([
      triggerSharedDependenciesBuild(watcher),
      triggerSharedDependenciesBuild(watcher),
      triggerSharedDependenciesBuild(watcher),
    ]);

    expect(buildSharedDependenciesBundleMock).toHaveBeenCalledTimes(2);
  });

  it('restarts the components exactly once when a sharedDependencies is added', async () => {
    const watcher = createWatcher(undefined);

    await watcher.start();

    expect(buildSharedDependenciesBundleMock).not.toHaveBeenCalled();

    await watcher.restart(SOURCE_PATHS, SHARED_DEPENDENCIES_MANIFEST);

    expect(buildSharedDependenciesBundleMock).toHaveBeenCalledTimes(1);
    expect(componentsWatcherInstance.restart).toHaveBeenCalledTimes(1);
  });

  it('restarts the components when a dependency rebuild changes the sharedDependencies checksum', async () => {
    const watcher = createWatcher(SHARED_DEPENDENCIES_MANIFEST);

    await watcher.start();

    mockSharedDependenciesBuildWithChecksum('checksum-2');

    await triggerSharedDependenciesBuild(watcher);

    expect(componentsWatcherInstance.restart).toHaveBeenCalledTimes(1);
  });

  it('does not restart the components when the rebuilt sharedDependencies is unchanged', async () => {
    const watcher = createWatcher(SHARED_DEPENDENCIES_MANIFEST);

    await watcher.start();

    await triggerSharedDependenciesBuild(watcher);

    expect(componentsWatcherInstance.restart).not.toHaveBeenCalled();
  });

  it('ignores a sharedDependencies build that was in flight when the manifest changed', async () => {
    const handleFileBuilt = vi.fn();
    const watcher = new FrontComponentsWatcher({
      appPath: '/app',
      sourcePaths: SOURCE_PATHS,
      sharedDependencies: SHARED_DEPENDENCIES_MANIFEST,
      shouldSkipTypecheck: () => true,
      handleFileBuilt,
      handleBuildError: vi.fn(),
    });

    await watcher.start();

    let resolveInFlightBuild: (() => void) | undefined;

    buildSharedDependenciesBundleMock.mockImplementationOnce(
      async ({ onFileBuilt }) => {
        await new Promise<void>((resolve) => {
          resolveInFlightBuild = resolve;
        });

        await onFileBuilt?.({
          fileFolder: FileFolder.BuiltFrontComponent,
          builtPath: 'src/sharedDependencies.mjs',
          sourcePath: 'src/sharedDependencies.ts',
          checksum: 'stale-checksum',
        });

        return { exportNamesBySpecifier: new Map() };
      },
    );

    const inFlightBuild = triggerSharedDependenciesBuild(watcher);

    mockSharedDependenciesBuildWithChecksum('checksum-2');

    const restartPromise = watcher.restart(SOURCE_PATHS, {
      ...SHARED_DEPENDENCIES_MANIFEST,
      dependencies: ['react', 'react-dom/client'],
    });

    resolveInFlightBuild?.();

    await Promise.all([inFlightBuild, restartPromise]);

    expect(handleFileBuilt).not.toHaveBeenCalledWith(
      expect.objectContaining({ checksum: 'stale-checksum' }),
    );
    expect(handleFileBuilt).toHaveBeenCalledWith(
      expect.objectContaining({ checksum: 'checksum-2' }),
    );
  });

  it('reports a restart is needed only when the paths or the sharedDependencies manifest change', () => {
    const watcher = createWatcher(SHARED_DEPENDENCIES_MANIFEST);

    expect(
      watcher.shouldRestart(SOURCE_PATHS, SHARED_DEPENDENCIES_MANIFEST),
    ).toBe(true);

    return watcher.start().then(() => {
      expect(
        watcher.shouldRestart(SOURCE_PATHS, SHARED_DEPENDENCIES_MANIFEST),
      ).toBe(false);
      expect(watcher.shouldRestart(SOURCE_PATHS, undefined)).toBe(true);
      expect(
        watcher.shouldRestart(SOURCE_PATHS, {
          ...SHARED_DEPENDENCIES_MANIFEST,
          dependencies: ['react', 'react-dom/client'],
        }),
      ).toBe(true);
    });
  });
});
