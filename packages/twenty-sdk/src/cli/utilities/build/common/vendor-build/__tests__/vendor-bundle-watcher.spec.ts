import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildVendorBundle } from '@/cli/utilities/build/common/vendor-build/build-vendor-bundle';
import { VendorBundleWatcher } from '@/cli/utilities/build/common/vendor-build/vendor-bundle-watcher';

vi.mock('@/cli/utilities/build/common/vendor-build/build-vendor-bundle', () => ({
  buildVendorBundle: vi.fn(),
}));

vi.mock('@/cli/utilities/file/fs-utils', () => ({
  pathExists: vi.fn(async () => false),
}));

const VENDOR_MANIFEST = {
  dependencies: ['react'],
  sourceVendorPath: 'src/vendor.ts',
  builtVendorPath: 'src/vendor.mjs',
  builtVendorChecksum: null,
};

const buildVendorBundleMock = vi.mocked(buildVendorBundle);

const createWatcher = () =>
  new VendorBundleWatcher({
    appPath: '/app',
    vendor: VENDOR_MANIFEST,
    handleFileBuilt: vi.fn(),
    handleBuildError: vi.fn(),
    handleVendorRebuilt: vi.fn(),
  });

const triggerBuild = (watcher: VendorBundleWatcher): Promise<void> =>
  (watcher as unknown as { build: () => Promise<void> }).build();

describe('VendorBundleWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('never runs two builds at the same time', async () => {
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

    const watcher = createWatcher();

    await Promise.all([
      triggerBuild(watcher),
      triggerBuild(watcher),
      triggerBuild(watcher),
    ]);

    expect(maxConcurrentBuildCount).toBe(1);
  });

  it('runs one queued build after the in flight one instead of one per request', async () => {
    buildVendorBundleMock.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      return { exportNamesBySpecifier: new Map() };
    });

    const watcher = createWatcher();

    await Promise.all([
      triggerBuild(watcher),
      triggerBuild(watcher),
      triggerBuild(watcher),
    ]);

    expect(buildVendorBundleMock).toHaveBeenCalledTimes(2);
  });
});
