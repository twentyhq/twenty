import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import * as esbuild from 'esbuild';
import { afterEach, describe, expect, it } from 'vitest';

import {
  buildStubModuleSource,
  createStubTwentySdkDefinePlugin,
} from '@/app/bundles/plugins/stub-twenty-sdk-define.plugin';

const appPaths: string[] = [];

afterEach(async () => {
  await Promise.all(
    appPaths
      .splice(0)
      .map((appPath) => rm(appPath, { recursive: true, force: true })),
  );
});

const importSource = (source: string) =>
  import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  );

const createAppWithSdkDefine = async (defineSource: string) => {
  const appPath = await mkdtemp(join(tmpdir(), 'twenty-sdk-define-stub-'));
  appPaths.push(appPath);
  const sdkPath = join(appPath, 'node_modules/twenty-sdk');

  await mkdir(sdkPath, { recursive: true });
  await writeFile(join(appPath, 'package.json'), '{}');
  await writeFile(
    join(sdkPath, 'package.json'),
    JSON.stringify({
      name: 'twenty-sdk',
      exports: { './define': './define.cjs' },
    }),
  );
  await writeFile(join(sdkPath, 'define.cjs'), defineSource);

  return appPath;
};

describe('buildStubModuleSource', () => {
  it('keeps non-enumerable plain data properties non-enumerable', async () => {
    const Flag = Object.defineProperty({ CURRENT: 'flag-id' }, 'DEPRECATED', {
      value: 'flag-id',
    });

    const { Flag: stubbedFlag } = await importSource(
      buildStubModuleSource({ Flag }),
    );

    expect(stubbedFlag.DEPRECATED).toBe('flag-id');
    expect(Object.keys(stubbedFlag)).toEqual(['CURRENT']);
    expect(
      Object.getOwnPropertyDescriptor(stubbedFlag, 'DEPRECATED')?.enumerable,
    ).toBe(false);
  });

  it('inlines enumerable values when a non-enumerable property is a function', async () => {
    const Flag = Object.defineProperty({ CURRENT: 'flag-id' }, 'describe', {
      value: () => 'flag',
    });

    const { Flag: stubbedFlag } = await importSource(
      buildStubModuleSource({ Flag }),
    );

    expect(stubbedFlag.CURRENT).toBe('flag-id');
    expect(Object.getOwnPropertyNames(stubbedFlag)).toEqual(['CURRENT']);
  });

  it('stays tree-shakeable when an aliased export is unused', async () => {
    const appPath = await createAppWithSdkDefine(
      `exports.defineThing = (config) => config;
exports.Flag = Object.defineProperty({ CURRENT: 'unused-flag-id' }, 'DEPRECATED', { value: 'unused-flag-id' });`,
    );
    const outfile = join(appPath, 'out.mjs');

    await esbuild.build({
      stdin: {
        contents: `import { defineThing } from 'twenty-sdk/define';
export default defineThing({});`,
        resolveDir: appPath,
      },
      bundle: true,
      format: 'esm',
      outfile,
      plugins: [createStubTwentySdkDefinePlugin(appPath)],
    });

    expect(await readFile(outfile, 'utf8')).not.toContain('unused-flag-id');
    expect((await import(pathToFileURL(outfile).href)).default).toMatchObject({
      success: true,
    });
  });
});
