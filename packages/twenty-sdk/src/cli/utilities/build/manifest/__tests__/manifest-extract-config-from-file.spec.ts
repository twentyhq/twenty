import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import vm from 'node:vm';
import { createRequire } from 'module';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';
import { type ApplicationConfig } from '@/sdk/define';

describe('extractManifestFromFile', () => {
  const filePath = join(MINIMAL_APP_PATH, 'application.config.ts');

  it('extracts the default-exported config from a bundled entity file', async () => {
    const result = await extractManifestFromFile<ApplicationConfig>({
      filePath,
      appPath: MINIMAL_APP_PATH,
    });

    expect(result.config.displayName).toBe('Root App');
  }, 60000);

  // Regression test for the dev-mode OOM crash: bundled entity modules used to be
  // written to disk and required, leaking one fully-bundled module per file into
  // the require cache on every rebuild. Evaluating in memory keeps it bounded.
  it('does not grow the require cache across rebuilds', async () => {
    const requireCache = createRequire(import.meta.url).cache;

    // Warm up so first-time dependency loads don't count against the assertion.
    await extractManifestFromFile<ApplicationConfig>({
      filePath,
      appPath: MINIMAL_APP_PATH,
    });

    const before = Object.keys(requireCache).length;

    for (let index = 0; index < 5; index++) {
      await extractManifestFromFile<ApplicationConfig>({
        filePath,
        appPath: MINIMAL_APP_PATH,
      });
    }

    expect(Object.keys(requireCache).length).toBe(before);
  }, 60000);
});

// Regression guard for the dev-mode OOM (twenty#2601). The manifest is rebuilt
// on every file change and previously recompiled every entity file through
// vm.compileFunction each time, which V8 never releases. The compiled wrapper
// is now cached per file, so an unchanged file must not be recompiled and a
// changed file must replace (not accumulate) its previous build. Fresh temp
// files are used so the per-file cache is cold regardless of test order.
describe('extractManifestFromFile compiled-module caching', () => {
  let tmpDir: string;

  const writeConfigFile = async (
    configFilePath: string,
    config: Record<string, unknown>,
  ): Promise<void> => {
    await writeFile(
      configFilePath,
      `export default ${JSON.stringify(config)};\n`,
      'utf8',
    );
  };

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(os.tmpdir(), 'manifest-extract-cache-test-'));
    await writeFile(
      join(tmpDir, 'package.json'),
      '{ "name": "test-app" }',
      'utf8',
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('compiles an unchanged file only once across repeated builds', async () => {
    const configFilePath = join(tmpDir, 'unchanged-config.ts');
    const config = { name: 'unchanged' };
    await writeConfigFile(configFilePath, config);

    const compileFunctionSpy = vi.spyOn(vm, 'compileFunction');

    const firstResult = await extractManifestFromFile({
      filePath: configFilePath,
      appPath: tmpDir,
    });
    const secondResult = await extractManifestFromFile({
      filePath: configFilePath,
      appPath: tmpDir,
    });
    const thirdResult = await extractManifestFromFile({
      filePath: configFilePath,
      appPath: tmpDir,
    });

    // Three rebuilds, but identical output is compiled only once.
    expect(compileFunctionSpy).toHaveBeenCalledTimes(1);

    // Behaviour is unchanged: every call still returns the extracted config.
    expect(firstResult).toEqual(config);
    expect(secondResult).toEqual(config);
    expect(thirdResult).toEqual(config);
  }, 60000);

  it('recompiles when the file output changes', async () => {
    const configFilePath = join(tmpDir, 'changing-config.ts');
    await writeConfigFile(configFilePath, { name: 'before' });

    const compileFunctionSpy = vi.spyOn(vm, 'compileFunction');

    const beforeResult = await extractManifestFromFile({
      filePath: configFilePath,
      appPath: tmpDir,
    });

    await writeConfigFile(configFilePath, { name: 'after' });

    const afterResult = await extractManifestFromFile({
      filePath: configFilePath,
      appPath: tmpDir,
    });

    // One compile per distinct output, and the new content is returned.
    expect(compileFunctionSpy).toHaveBeenCalledTimes(2);
    expect(beforeResult).toEqual({ name: 'before' });
    expect(afterResult).toEqual({ name: 'after' });
  }, 60000);
});
