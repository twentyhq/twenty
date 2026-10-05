import { existsSync } from 'node:fs';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stop } from 'esbuild';
import { isPlainObject } from 'twenty-shared/utils';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import { type WatchInputs } from '@/app/dev/types/watch-inputs.type';
import { runAppWorker } from '@/app/run-app-worker';

const launch = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));

vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => launch,
}));

const REPOSITORY_ROOT = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);
const MINIMAL_APP = join(
  REPOSITORY_ROOT,
  'packages/twenty-apps/fixtures/minimal-app',
);
const REPOSITORY_PACKAGES = [
  'react',
  'react-dom',
  '@types',
  '@sniptt/guards',
  'typescript',
  'twenty-shared',
  'twenty-client-sdk',
  'twenty-ui',
];
const SDK_EXPORTS = [
  'define',
  'front-component',
  'logic-function',
  'billing',
  'utils',
];
const IGNORED_SEGMENTS = ['node_modules', '.git', '.twenty'];

type Workspace = {
  workspace: string;
  appPath: string;
};

describe('dev watch inputs reported by the app worker', () => {
  let root: string;

  const writeFiles = async (
    directory: string,
    files: Record<string, string>,
  ) => {
    for (const [name, content] of Object.entries(files)) {
      await mkdir(dirname(join(directory, name)), { recursive: true });
      await writeFile(join(directory, name), content);
    }
  };

  const writeLinkedPackage = async ({
    workspace,
    name,
    files,
  }: {
    workspace: string;
    name: string;
    files: Record<string, string>;
  }) => {
    await writeFiles(join(workspace, 'libs', name), {
      'package.json': JSON.stringify({
        name,
        version: '1.0.0',
        main: 'index.js',
        types: 'index.d.ts',
      }),
      ...files,
    });
    await symlink(
      join(workspace, 'libs', name),
      join(workspace, 'app/node_modules', name),
    );
  };

  const createWorkspace = async (): Promise<Workspace> => {
    const workspace = await realpath(await mkdtemp(join(root, 'workspace-')));
    const appPath = join(workspace, 'app');

    await cp(MINIMAL_APP, appPath, {
      recursive: true,
      filter: (source) =>
        !source
          .split(sep)
          .some((part) => ['node_modules', '.twenty', 'dist'].includes(part)),
    });
    await mkdir(join(appPath, 'node_modules'));

    for (const name of await readdir(join(root, 'node_modules'))) {
      await symlink(
        join(root, 'node_modules', name),
        join(appPath, 'node_modules', name),
      );
    }

    const appConfig = JSON.parse(
      await readFile(join(appPath, 'tsconfig.json'), 'utf8'),
    );
    const compilerOptions = Object.fromEntries(
      Object.entries(appConfig.compilerOptions).filter(
        ([option]) => option !== 'baseUrl' && option !== 'paths',
      ),
    );

    await writeFiles(workspace, {
      'tsconfig.base.json': JSON.stringify({ compilerOptions }),
      'shared-src/relative-label.ts': `export const RELATIVE_LABEL = 'relative';\n`,
    });
    await writeFiles(appPath, {
      'tsconfig.json': JSON.stringify({
        extends: '../tsconfig.base.json',
        include: appConfig.include,
        exclude: appConfig.exclude,
      }),
      'my.object.ts': (await readFile(join(appPath, 'my.object.ts'), 'utf8'))
        .replace(
          "import { FieldType, defineObject } from 'twenty-sdk/define';",
          "import { OBJECT_DESCRIPTION } from 'define-lib';\nimport { FieldType, defineObject } from 'twenty-sdk/define';",
        )
        .replace("'A simple root-level object'", 'OBJECT_DESCRIPTION'),
      'my.function.ts': (
        await readFile(join(appPath, 'my.function.ts'), 'utf8')
      )
        .replace(
          "import { defineLogicFunction } from 'twenty-sdk/define';",
          "import { FUNCTION_RESULT } from 'function-lib';\nimport { defineLogicFunction } from 'twenty-sdk/define';\n\nimport { RELATIVE_LABEL } from '../shared-src/relative-label';",
        )
        .replace(
          "return 'my-function-result';",
          'return `${FUNCTION_RESULT}-${RELATIVE_LABEL}`;',
        ),
      'my.front-component.tsx': (
        await readFile(join(appPath, 'my.front-component.tsx'), 'utf8')
      )
        .replace(
          "import 'twenty-ui/style.css';",
          "import 'twenty-ui/style.css';\nimport 'component-lib/theme.css';\nimport { COMPONENT_TITLE } from 'component-lib';",
        )
        .replace('<h2>My Component</h2>', '<h2>{COMPONENT_TITLE}</h2>'),
    });

    await writeLinkedPackage({
      workspace,
      name: 'define-lib',
      files: {
        'index.js': `export const OBJECT_DESCRIPTION = 'Described by a linked package';\n`,
        'index.d.ts': 'export declare const OBJECT_DESCRIPTION: string;\n',
      },
    });
    await writeLinkedPackage({
      workspace,
      name: 'function-lib',
      files: {
        'index.js': `export const FUNCTION_RESULT = 'linked-result';\n`,
        'index.d.ts': 'export declare const FUNCTION_RESULT: string;\n',
      },
    });
    await writeLinkedPackage({
      workspace,
      name: 'component-lib',
      files: {
        'index.js': `export const COMPONENT_TITLE = 'Linked title';\n`,
        'index.d.ts': 'export declare const COMPONENT_TITLE: string;\n',
        'theme.css': '.linked-title { color: rebeccapurple; }\n',
      },
    });

    return { workspace, appPath };
  };

  const bundleSnapshot = async ({
    appPath,
    collectWatchInputs,
  }: {
    appPath: string;
    collectWatchInputs: boolean;
  }) => {
    const response = await runAppWorker({
      request: {
        type: 'bundleSnapshot',
        appPath,
        holdSnapshot: false,
        ...(collectWatchInputs ? { collectWatchInputs: true } : {}),
      },
      signal: new AbortController().signal,
    });

    return {
      isSuccess:
        isPlainObject(response.result) && response.result.success === true,
      result: response.result,
      watchInputs: response.watchInputs,
    };
  };

  const describeInputs = (watchInputs: WatchInputs, workspace: string) =>
    watchInputs
      .filter((input) => !relative(workspace, input.path).startsWith('..'))
      .map(
        (input) => `${input.kind}:${relative(workspace, input.path) || '.'}`,
      );

  const findInput = (
    watchInputs: WatchInputs,
    kind: 'file' | 'directory',
    path: string,
  ) => watchInputs.find((input) => input.kind === kind && input.path === path);

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-dev-watch-inputs-'));

    const modules = join(root, 'node_modules');
    const sourceSdk = join(REPOSITORY_ROOT, 'packages/twenty-sdk');
    const sdkPath = join(modules, 'twenty-sdk');
    const sdkRequire = createRequire(join(sourceSdk, 'package.json'));

    await mkdir(join(modules, '@sniptt'), { recursive: true });

    for (const name of REPOSITORY_PACKAGES) {
      await symlink(
        join(REPOSITORY_ROOT, 'node_modules', name),
        join(modules, name),
      );
    }
    await symlink(
      dirname(sdkRequire.resolve('uuid/package.json')),
      join(modules, 'uuid'),
    );

    const packageJson = JSON.parse(
      await readFile(join(sourceSdk, 'package.json'), 'utf8'),
    );
    const exports: Record<string, unknown> = {};

    for (const name of SDK_EXPORTS) {
      await cp(join(sourceSdk, 'dist', name), join(sdkPath, 'dist', name), {
        recursive: true,
      });
      exports[`./${name}`] = packageJson.exports[`./${name}`];
    }

    await writeFile(
      join(sdkPath, 'package.json'),
      JSON.stringify({
        name: packageJson.name,
        version: packageJson.version,
        engines: packageJson.engines,
        exports,
      }),
    );
    await buildTestAppWorker(join(root, 'cli'));
    launch.modulePath = join(root, 'cli/app-worker.cjs');
  }, 120_000);

  afterAll(async () => {
    await stop();
    await rm(root, { recursive: true, force: true });
  });

  it('reports linked files read by definitions, bundles and the typecheck, and nothing above the workspace', async () => {
    const { workspace, appPath } = await createWorkspace();

    const { isSuccess, result, watchInputs } = await bundleSnapshot({
      appPath,
      collectWatchInputs: true,
    });

    expect(isSuccess, JSON.stringify(result)).toBe(true);
    expect(watchInputs).toBeDefined();

    const inputs = watchInputs ?? [];

    expect(describeInputs(inputs, workspace)).toEqual(
      expect.arrayContaining([
        'file:libs/define-lib/index.js',
        'file:libs/function-lib/index.js',
        'file:libs/component-lib/index.js',
        'file:libs/component-lib/theme.css',
        'file:shared-src/relative-label.ts',
        'file:tsconfig.base.json',
        'directory:libs/define-lib',
        'directory:libs/function-lib',
        'directory:libs/component-lib',
        'directory:shared-src',
        'directory:.',
      ]),
    );

    for (const input of inputs) {
      expect(
        input.path.split(sep).filter((part) => IGNORED_SEGMENTS.includes(part)),
        input.path,
      ).toEqual([]);
      expect(input.stamp === null, input.path).toBe(!existsSync(input.path));
    }

    expect(
      inputs
        .filter((input) => input.kind === 'directory')
        .map((input) => input.path)
        .filter((path) => workspace.startsWith(`${path}${sep}`)),
    ).toEqual([]);

    const existingFileDirectories = new Set(
      inputs
        .filter((input) => input.kind === 'file' && input.stamp !== null)
        .map((input) => dirname(input.path)),
    );

    expect(
      inputs
        .filter((input) => input.kind === 'file' && input.stamp === null)
        .map((input) => input.path)
        .filter((path) => !existingFileDirectories.has(dirname(path))),
    ).toEqual([]);
  }, 120_000);

  it('reports a linked file that breaks the build, and a changed stamp once it is fixed', async () => {
    const { workspace, appPath } = await createWorkspace();
    const linkedFile = join(workspace, 'libs/function-lib/index.js');

    await writeFile(linkedFile, 'export const FUNCTION_RESULT = ;\n');

    const broken = await bundleSnapshot({ appPath, collectWatchInputs: true });
    const brokenInput = findInput(broken.watchInputs ?? [], 'file', linkedFile);

    expect(broken.isSuccess).toBe(false);
    expect(brokenInput?.stamp ?? null).not.toBeNull();

    await writeFile(linkedFile, `export const FUNCTION_RESULT = 'fixed';\n`);

    const fixed = await bundleSnapshot({ appPath, collectWatchInputs: true });
    const fixedInput = findInput(fixed.watchInputs ?? [], 'file', linkedFile);

    expect(fixed.isSuccess, JSON.stringify(fixed.result)).toBe(true);
    expect(fixedInput?.stamp ?? null).not.toBeNull();
    expect(fixedInput?.stamp).not.toBe(brokenInput?.stamp);
  }, 120_000);

  it('reports the directory of a missing linked import so its creation can trigger a rebuild', async () => {
    const { workspace, appPath } = await createWorkspace();
    const extrasDirectory = join(workspace, 'libs/function-lib-extras');

    await mkdir(extrasDirectory);
    await writeFile(
      join(workspace, 'libs/function-lib/index.js'),
      `export { EXTRA as FUNCTION_RESULT } from '../function-lib-extras/extra.js';\n`,
    );

    const missing = await bundleSnapshot({ appPath, collectWatchInputs: true });

    expect(missing.isSuccess).toBe(false);
    expect(
      findInput(missing.watchInputs ?? [], 'directory', extrasDirectory)?.stamp,
    ).toBe(JSON.stringify([]));

    await writeFile(
      join(extrasDirectory, 'extra.js'),
      `export const EXTRA = 'extra';\n`,
    );

    const created = await bundleSnapshot({ appPath, collectWatchInputs: true });

    expect(created.isSuccess, JSON.stringify(created.result)).toBe(true);
    expect(
      findInput(created.watchInputs ?? [], 'directory', extrasDirectory)?.stamp,
    ).toBe(JSON.stringify(['extra.js']));
    expect(
      findInput(
        created.watchInputs ?? [],
        'file',
        join(extrasDirectory, 'extra.js'),
      ),
    ).toBeDefined();
  }, 120_000);

  it('reports a linked package that only the shared dependencies bundle reads', async () => {
    const { workspace, appPath } = await createWorkspace();
    const packageJsonPath = join(appPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    await writeLinkedPackage({
      workspace,
      name: 'shared-lib',
      files: {
        'index.js': 'export const SHARED_VALUE = 1;\n',
        'index.d.ts': 'export declare const SHARED_VALUE: number;\n',
      },
    });
    await writeFile(
      packageJsonPath,
      JSON.stringify({
        ...packageJson,
        frontComponentSharedDependencies: ['shared-lib'],
      }),
    );

    const { isSuccess, result, watchInputs } = await bundleSnapshot({
      appPath,
      collectWatchInputs: true,
    });

    expect(isSuccess, JSON.stringify(result)).toBe(true);
    expect(describeInputs(watchInputs ?? [], workspace)).toEqual(
      expect.arrayContaining([
        'file:libs/shared-lib/index.js',
        'directory:libs/shared-lib',
      ]),
    );
  }, 120_000);

  it('reports an external tsconfig that breaks the build, so fixing it can trigger a rebuild', async () => {
    const { workspace, appPath } = await createWorkspace();
    const baseConfigPath = join(workspace, 'tsconfig.base.json');
    const baseConfig = await readFile(baseConfigPath, 'utf8');

    await writeFile(baseConfigPath, '{ "compilerOptions": ');

    const broken = await bundleSnapshot({ appPath, collectWatchInputs: true });

    expect(broken.isSuccess).toBe(false);
    expect(
      findInput(broken.watchInputs ?? [], 'file', baseConfigPath)?.stamp ??
        null,
    ).not.toBeNull();

    await writeFile(baseConfigPath, baseConfig);

    const fixed = await bundleSnapshot({ appPath, collectWatchInputs: true });

    expect(fixed.isSuccess, JSON.stringify(fixed.result)).toBe(true);
  }, 120_000);

  it('reports the target of a public asset symlinked from outside the app', async () => {
    const { workspace, appPath } = await createWorkspace();

    await writeFiles(workspace, {
      'shared-assets/logo.svg':
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>\n',
    });
    await mkdir(join(appPath, 'public'));
    await symlink(
      join(workspace, 'shared-assets/logo.svg'),
      join(appPath, 'public/logo.svg'),
    );

    const { isSuccess, result, watchInputs } = await bundleSnapshot({
      appPath,
      collectWatchInputs: true,
    });

    expect(isSuccess, JSON.stringify(result)).toBe(true);
    expect(describeInputs(watchInputs ?? [], workspace)).toEqual(
      expect.arrayContaining([
        'file:shared-assets/logo.svg',
        'directory:shared-assets',
      ]),
    );
  }, 120_000);

  it('returns no watch inputs unless they are requested', async () => {
    const { appPath } = await createWorkspace();

    const { isSuccess, result, watchInputs } = await bundleSnapshot({
      appPath,
      collectWatchInputs: false,
    });

    expect(isSuccess, JSON.stringify(result)).toBe(true);
    expect(watchInputs).toBeUndefined();
  }, 120_000);
});
