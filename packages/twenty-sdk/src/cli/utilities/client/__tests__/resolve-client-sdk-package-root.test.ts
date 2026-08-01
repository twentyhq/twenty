import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveClientSdkPackageRoot } from '@/cli/utilities/client/resolve-client-sdk-package-root';

describe('resolveClientSdkPackageRoot', () => {
  let temporaryDir: string;

  beforeEach(async () => {
    temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-sdk-resolve-'));
  });

  afterEach(async () => {
    await rm(temporaryDir, { recursive: true, force: true });
  });

  it('resolves the package in the start path node_modules', async () => {
    const appPath = join(temporaryDir, 'packages', 'my-app');
    const packageRoot = join(appPath, 'node_modules', 'twenty-client-sdk');
    await mkdir(packageRoot, { recursive: true });

    await expect(resolveClientSdkPackageRoot(appPath)).resolves.toBe(
      packageRoot,
    );
  });

  it('walks up to a hoisted install in a parent node_modules', async () => {
    const packageRoot = join(temporaryDir, 'node_modules', 'twenty-client-sdk');
    const appPath = join(temporaryDir, 'packages', 'my-app');
    await mkdir(packageRoot, { recursive: true });
    await mkdir(appPath, { recursive: true });

    await expect(resolveClientSdkPackageRoot(appPath)).resolves.toBe(
      packageRoot,
    );
  });

  it('prefers the closest install over a hoisted one', async () => {
    const hoistedRoot = join(temporaryDir, 'node_modules', 'twenty-client-sdk');
    const appPath = join(temporaryDir, 'packages', 'my-app');
    const localRoot = join(appPath, 'node_modules', 'twenty-client-sdk');
    await mkdir(hoistedRoot, { recursive: true });
    await mkdir(localRoot, { recursive: true });

    await expect(resolveClientSdkPackageRoot(appPath)).resolves.toBe(localRoot);
  });

  it('returns undefined when the package is not installed anywhere', async () => {
    const appPath = join(temporaryDir, 'packages', 'my-app');
    await mkdir(appPath, { recursive: true });

    await expect(resolveClientSdkPackageRoot(appPath)).resolves.toBeUndefined();
  });
});
