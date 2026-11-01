import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { createSourceTestApp } from '@/app/source/__tests__/utils/create-source-test-app';

describe('source SDK compatibility', () => {
  let appPath: string;
  let sdkPath: string;

  const updatePackage = async (fields: Record<string, unknown>) => {
    const packagePath = join(sdkPath, 'package.json');
    await writeFile(
      packagePath,
      JSON.stringify({
        ...JSON.parse(await readFile(packagePath, 'utf8')),
        ...fields,
      }),
    );
  };

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-source-sdk-'));
    sdkPath = await realpath(await createSourceTestApp(appPath));
    await writeFile(
      join(sdkPath, 'define.cjs'),
      'throw new Error("do not execute the SDK in the parent");',
    );
  });
  afterEach(async () => rm(appPath, { recursive: true, force: true }));

  it('checks only public authoring exports, without a build descriptor or project compiler', async () => {
    expect(await resolveSourceSdk({ appPath })).toEqual({
      version: '2.44.0',
      packagePath: sdkPath,
    });
    const resolve = createRequire(join(appPath, 'package.json')).resolve;

    expect(() => resolve('twenty-sdk/build')).toThrow();
    expect(() => resolve('typescript')).toThrow();
  });

  it.each(['1.23.0', '2.44.0-canary.1', '3.0.0'])(
    'accepts %s when the public entry points exist',
    async (version) => {
      await updatePackage({ version });
      expect((await resolveSourceSdk({ appPath })).version).toBe(version);
    },
  );

  it.each(['1.22.0', 'unknown'])(
    'rejects unsupported SDK version %s',
    async (version) => {
      await updatePackage({ version });
      await expect(resolveSourceSdk({ appPath })).rejects.toMatchObject({
        code: 'SDK_SOURCE_UNSUPPORTED',
      });
    },
  );

  it('requires the authoring entry points even for a recent version', async () => {
    await updatePackage({ exports: { './define': './define.cjs' } });
    await expect(resolveSourceSdk({ appPath })).rejects.toMatchObject({
      code: 'SDK_SOURCE_UNSUPPORTED',
      details: { missingEntryPoints: ['twenty-sdk/front-component'] },
    });
  });

  it('warns and continues when this Node is newer than the SDK declares', async () => {
    await updatePackage({ engines: { node: '^1.0.0' } });
    const warn = vi.fn();

    expect(await resolveSourceSdk({ appPath, warn })).toEqual({
      version: '2.44.0',
      packagePath: sdkPath,
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith({
      code: 'NODE_VERSION_UNTESTED',
      message: `twenty-sdk 2.44.0 declares Node ^1.0.0; continuing on Node ${process.versions.node}, which is outside that range.`,
    });
  });

  it.each([
    { node: '>=999.0.0', code: 'NODE_VERSION_UNSUPPORTED' },
    { node: 'not-semver', code: 'SDK_SOURCE_UNSUPPORTED' },
  ])(
    'checks the installed SDK Node requirement $node',
    async ({ node, code }) => {
      await updatePackage({ engines: { node } });
      await expect(resolveSourceSdk({ appPath })).rejects.toMatchObject({
        code,
      });
    },
  );

  it('resolves a hoisted SDK and a workspace symlink without importing it', async () => {
    const nestedPath = join(appPath, 'apps/demo');
    await mkdir(nestedPath, { recursive: true });
    await writeFile(join(nestedPath, 'package.json'), '{}');
    expect((await resolveSourceSdk({ appPath: nestedPath })).packagePath).toBe(
      sdkPath,
    );

    const linkedPath = join(appPath, 'linked-app');
    await mkdir(join(linkedPath, 'node_modules'), { recursive: true });
    await writeFile(join(linkedPath, 'package.json'), '{}');
    await symlink(sdkPath, join(linkedPath, 'node_modules/twenty-sdk'));
    expect((await resolveSourceSdk({ appPath: linkedPath })).packagePath).toBe(
      sdkPath,
    );
  });

  it('distinguishes missing, broken and unsupported PnP installations', async () => {
    await writeFile(join(sdkPath, 'package.json'), '{');
    await expect(resolveSourceSdk({ appPath })).rejects.toMatchObject({
      code: 'TOOLING_UNSUPPORTED',
    });
    await rm(sdkPath, { recursive: true });
    await expect(resolveSourceSdk({ appPath })).rejects.toMatchObject({
      code: 'SDK_NOT_INSTALLED',
    });
    await writeFile(
      join(appPath, '.pnp.cjs'),
      'throw new Error("never imported");',
    );
    await expect(resolveSourceSdk({ appPath })).rejects.toMatchObject({
      code: 'TOOLING_UNSUPPORTED',
      message: expect.stringContaining("Plug'n'Play"),
    });
  });
});
