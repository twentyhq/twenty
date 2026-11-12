import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { buildApplication } from '@/app/bundles/build-application';
import { collectApplicationSourceFiles } from '@/app/bundles/collect-application-source-files';
import { collectWatchInputs } from '@/app/dev/collect-watch-inputs';
import { manifestUpdateChecksums } from '@/app/manifest/manifest-update-checksums';
import { type EntityFilePaths } from '@/app/manifest/types/entity-file-paths.type';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.map((root) => rm(root, { recursive: true, force: true })),
  );
  roots.length = 0;
});
const fixture = async (files: Record<string, string | Buffer>) => {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), 'source-inventory-')),
  );
  roots.push(root);
  for (const [path, content] of Object.entries({
    'tsconfig.json': '{}',
    ...files,
  })) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
};

describe('application source inventory', () => {
  it('builds and retains runtime imports, type-only aliases, nested styles and binary assets', async () => {
    const image = Buffer.from([0, 255, 1, 128]);
    const appPath = await fixture({
      'tsconfig.json': JSON.stringify({ extends: './config/base.json' }),
      'config/base.json': JSON.stringify({
        compilerOptions: {
          moduleResolution: 'bundler',
          module: 'esnext',
          paths: { '@app/*': ['../src/*'] },
        },
      }),
      'package.json': '{"name":"source-fixture"}',
      'src/function.ts':
        "import { greeting } from './helper'; export const main = () => greeting;",
      'src/component.tsx':
        "import './style.css'; import { greeting } from './helper'; export const Component = () => greeting;",
      'src/helper.ts':
        "import type { Greeting } from '@app/types'; export const greeting: Greeting = 'hello';",
      'src/types.ts': 'export type Greeting = string;',
      'src/style.css': '@import "./nested.css";',
      'src/nested.css': '.logo { background: url("./logo.png"); }',
      'src/logo.png': image,
      'src/unrelated.ts': 'export const unrelated = true;',
      '.env': 'SECRET=never-export',
    });
    const manifest = {
      application: {},
      publicAssets: [],
      logicFunctions: [{ builtHandlerPath: 'src/function.mjs' }],
      frontComponents: [{ builtComponentPath: 'src/component.mjs' }],
    } as unknown as Manifest;
    const { result, watchInputs } = await collectWatchInputs(() =>
      buildApplication({
        appPath,
        manifest,
        filePaths: {
          logicFunctions: ['src/function.ts'],
          frontComponents: ['src/component.tsx'],
          publicAssets: [],
        } as unknown as EntityFilePaths,
      }),
    );
    const updated = manifestUpdateChecksums({
      manifest,
      builtFileInfos: result.builtFileInfos,
    });
    expect(updated.sourceFiles?.map((file) => file.filePath)).toEqual([
      'config/base.json',
      'src/component.tsx',
      'src/function.ts',
      'src/helper.ts',
      'src/logo.png',
      'src/nested.css',
      'src/style.css',
      'src/types.ts',
      'tsconfig.json',
    ]);
    expect(
      await readFile(join(appPath, '.twenty/output/src/logo.png')),
    ).toEqual(image);
    expect(
      await readFile(join(appPath, '.twenty/output/src/helper.ts'), 'utf8'),
    ).toContain("'@app/types'");
    expect(watchInputs.map((input) => input.path)).toContain(
      join(appPath, 'src/types.ts'),
    );
    expect(
      [...result.builtFileInfos.values()].filter(
        (file) =>
          file.fileFolder === FileFolder.Source &&
          file.sourcePath === 'src/helper.ts',
      ),
    ).toHaveLength(1);
    expect(
      updated.sourceFiles?.every((file) =>
        /^[a-f0-9]{32}$/.test(file.checksum),
      ),
    ).toBe(true);
    const rebuilt = manifestUpdateChecksums({
      manifest: updated,
      builtFileInfos: new Map(),
    });
    expect(rebuilt.sourceFiles).toEqual([]);
  });

  it('retains referenced declarations and ignores dependencies and unrelated files', async () => {
    const appPath = await fixture({
      'src/main.ts':
        "/// <reference path='./globals.d.ts' />\nimport type { Value } from 'some-package'; export type Local = Value;",
      'src/globals.d.ts': 'declare const currentUser: string;',
      'node_modules/some-package/package.json': '{"types":"index.d.ts"}',
      'node_modules/some-package/index.d.ts': 'export type Value = string;',
      'unrelated.json': '{}',
    });
    expect(
      collectApplicationSourceFiles({
        appPath,
        entryPaths: ['src/main.ts'],
        buildInputs: [],
      }),
    ).toEqual(['src/globals.d.ts', 'src/main.ts', 'tsconfig.json']);
  });

  it('excludes installed workspace dependencies even when the bundler resolves their real paths', async () => {
    const dependency = await fixture({
      'package.json': '{"name":"@fixture/dependency"}',
      'runtime.mjs': 'export const value = 1;',
    });
    const appPath = await fixture({ 'main.ts': 'export const value = 1;' });
    await mkdir(join(appPath, 'node_modules/@fixture'), { recursive: true });
    await symlink(
      dependency,
      join(appPath, 'node_modules/@fixture/dependency'),
    );
    expect(
      collectApplicationSourceFiles({
        appPath,
        entryPaths: ['main.ts'],
        buildInputs: [join(dependency, 'runtime.mjs')],
      }),
    ).toEqual(['main.ts', 'tsconfig.json']);
  });

  it('rejects a referenced symlink escaping the app', async () => {
    const outside = await fixture({
      'secret.ts': 'export const secret = true;',
    });
    const appPath = await fixture({ 'main.ts': "import './secret';" });
    await symlink(join(outside, 'secret.ts'), join(appPath, 'secret.ts'));
    expect(() =>
      collectApplicationSourceFiles({
        appPath,
        entryPaths: ['main.ts'],
        buildInputs: [],
      }),
    ).toThrow('Cannot preserve application source');
  });

  it('rejects missing local type-only imports', async () => {
    const appPath = await fixture({
      'main.ts':
        "import type { Missing } from './missing'; export type Value = Missing;",
    });
    expect(() =>
      collectApplicationSourceFiles({
        appPath,
        entryPaths: ['main.ts'],
        buildInputs: [],
      }),
    ).toThrow('Cannot preserve missing application source');
  });
});
