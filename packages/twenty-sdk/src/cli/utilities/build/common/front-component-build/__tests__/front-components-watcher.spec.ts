import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileFolder } from 'twenty-shared/types';

import { EsbuildWatcher } from '@/cli/utilities/build/common/esbuild-watcher';
import { FrontComponentsWatcher } from '@/cli/utilities/build/common/front-component-build/front-components-watcher';
import { buildVendorBundle } from '@/cli/utilities/build/common/vendor-build/build-vendor-bundle';

vi.mock('@/cli/utilities/build/common/vendor-build/build-vendor-bundle', () => ({
  buildVendorBundle: vi.fn(),
}));

vi.mock('@/cli/utilities/file/fs-utils', () => ({
  pathExists: vi.fn(async () => false),
}));

vi.mock('@/cli/utilities/build/common/esbuild-watcher', () => ({
  EsbuildWatcher: vi.fn(),
}));

const VENDOR_MANIFEST = {
  dependencies: ['react'],
  sourceVendorPath: 'src/vendor.ts',
  builtVendorPath: 'src/vendor.mjs',
  builtVendorChecksum: null,
};

const SOURCE_PATHS = ['src/my.front-component.tsx'];

const buildVendorBundleMock = vi.mocked(buildVendorBundle);
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

const mockVendorBuildWithChecksum = (checksum: string) => {
  buildVendorBundleMock.mockImplementation(async ({ onFileBuilt }) => {
    await onFileBuilt?.({
      fileFolder: FileFolder.BuiltFrontComponent,
      builtPath: 'src/vendor.mjs',
      sourcePath: 'src/vendor.ts',
      checksum,
    });

    return { exportNamesBySpecifier: new Map() };
  });
};

const createWatcher = (vendor?: typeof VENDOR_MANIFEST) =>
  new FrontComponentsWatcher({
    appPath: '/app',
    sourcePaths: SOURCE_PATHS,
    vendor,
    shouldSkipTypecheck: () => true,
    handleFileBuilt: vi.fn(),
    handleBuildError: vi.fn(),
  });

const triggerVendorBuild = (watcher: FrontComponentsWatcher): Promise<void> =>
  (
    watcher as unknown as { requestVendorBuild: () => Promise<void> }
  ).requestVendorBuild();

describe('FrontComponentsWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    componentsWatcherInstance = createComponentsWatcherInstance();
    esbuildWatcherMock.mockImplementation(function () {
      return componentsWatcherInstance as unknown as EsbuildWatcher;
    });
    mockVendorBuildWithChecksum('checksum-1');
  });

  it('builds the vendor before starting the component builds, without a restart', async () => {
    const watcher = createWatcher(VENDOR_MANIFEST);

    await watcher.start();

    expect(buildVendorBundleMock).toHaveBeenCalledTimes(1);
    expect(componentsWatcherInstance.start).toHaveBeenCalledTimes(1);
    expect(buildVendorBundleMock.mock.invocationCallOrder[0]).toBeLessThan(
      componentsWatcherInstance.start.mock.invocationCallOrder[0],
    );
    expect(componentsWatcherInstance.restart).not.toHaveBeenCalled();
  });

  it('never runs two vendor builds at the same time', async () => {
    let concurrentBuildCount = 0;
    let maxConcurrentBuildCount = 0;

    buildVendorBundleMock.mockImplementation(async () => {
      concurrentBuildCount += 1;
      maxConcurrentBuildCount = Math.max(
        maxConcurrentBuildCount,
        concurrentBuildCount,
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      concurrentBuildCount -= 1;

      return { exportNamesBySpecifier: new Map() };
    });

    const watcher = createWatcher(VENDOR_MANIFEST);

    await Promise.all([
      triggerVendorBuild(watcher),
      triggerVendorBuild(watcher),
      triggerVendorBuild(watcher),
    ]);

    expect(maxConcurrentBuildCount).toBe(1);
  });

  it('runs one queued build after the in flight one instead of one per request', async () => {
    buildVendorBundleMock.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      return { exportNamesBySpecifier: new Map() };
    });

    const watcher = createWatcher(VENDOR_MANIFEST);

    await Promise.all([
      triggerVendorBuild(watcher),
      triggerVendorBuild(watcher),
      triggerVendorBuild(watcher),
    ]);

    expect(buildVendorBundleMock).toHaveBeenCalledTimes(2);
  });

  it('restarts the components exactly once when a vendor is added', async () => {
    const watcher = createWatcher(undefined);

    await watcher.start();

    expect(buildVendorBundleMock).not.toHaveBeenCalled();

    await watcher.restart(SOURCE_PATHS, VENDOR_MANIFEST);

    expect(buildVendorBundleMock).toHaveBeenCalledTimes(1);
    expect(componentsWatcherInstance.restart).toHaveBeenCalledTimes(1);
  });

  it('restarts the components when a dependency rebuild changes the vendor checksum', async () => {
    const watcher = createWatcher(VENDOR_MANIFEST);

    await watcher.start();

    mockVendorBuildWithChecksum('checksum-2');

    await triggerVendorBuild(watcher);

    expect(componentsWatcherInstance.restart).toHaveBeenCalledTimes(1);
  });

  it('does not restart the components when the rebuilt vendor is unchanged', async () => {
    const watcher = createWatcher(VENDOR_MANIFEST);

    await watcher.start();

    await triggerVendorBuild(watcher);

    expect(componentsWatcherInstance.restart).not.toHaveBeenCalled();
  });

  it('ignores a vendor build that was in flight when the manifest changed', async () => {
    const handleFileBuilt = vi.fn();
    const watcher = new FrontComponentsWatcher({
      appPath: '/app',
      sourcePaths: SOURCE_PATHS,
      vendor: VENDOR_MANIFEST,
      shouldSkipTypecheck: () => true,
      handleFileBuilt,
      handleBuildError: vi.fn(),
    });

    await watcher.start();

    let resolveInFlightBuild: (() => void) | undefined;

    buildVendorBundleMock.mockImplementationOnce(async ({ onFileBuilt }) => {
      await new Promise<void>((resolve) => {
        resolveInFlightBuild = resolve;
      });

      await onFileBuilt?.({
        fileFolder: FileFolder.BuiltFrontComponent,
        builtPath: 'src/vendor.mjs',
        sourcePath: 'src/vendor.ts',
        checksum: 'stale-checksum',
      });

      return { exportNamesBySpecifier: new Map() };
    });

    const inFlightBuild = triggerVendorBuild(watcher);

    mockVendorBuildWithChecksum('checksum-2');

    const restartPromise = watcher.restart(SOURCE_PATHS, {
      ...VENDOR_MANIFEST,
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

  it('reports a restart is needed only when the paths or the vendor manifest change', () => {
    const watcher = createWatcher(VENDOR_MANIFEST);

    expect(watcher.shouldRestart(SOURCE_PATHS, VENDOR_MANIFEST)).toBe(true);

    return watcher.start().then(() => {
      expect(watcher.shouldRestart(SOURCE_PATHS, VENDOR_MANIFEST)).toBe(false);
      expect(watcher.shouldRestart(SOURCE_PATHS, undefined)).toBe(true);
      expect(
        watcher.shouldRestart(SOURCE_PATHS, {
          ...VENDOR_MANIFEST,
          dependencies: ['react', 'react-dom/client'],
        }),
      ).toBe(true);
    });
  });
});
