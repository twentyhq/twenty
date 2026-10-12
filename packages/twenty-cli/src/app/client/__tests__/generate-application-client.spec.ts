import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, stop } from 'esbuild';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import { installTestClientSdk } from '@/app/__tests__/utils/install-test-client-sdk';
import { generateApplicationClient } from '@/app/client/generate-application-client';
import { parseNullData, parseToolingResult } from '@/app/parse-tooling-result';
import { runAppWorker } from '@/app/run-app-worker';

const launch = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));
vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => launch,
}));
const REPOSITORY_ROOT = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);
const SCHEMA = 'type Query { greeting: String }';
const require = createRequire(import.meta.url);

describe('CLI client generation uses the app generator', () => {
  let root: string;
  let appPath: string;
  let packageRoot: string;
  let sdkEntryPath: string;

  const readGeneratedClient = async () => {
    const directory = join(packageRoot, 'dist/core/generated');
    const entries = await readdir(directory, {
      recursive: true,
      withFileTypes: true,
    });
    const paths = [
      'core.cjs',
      'core.mjs',
      ...entries
        .filter((entry) => entry.isFile())
        .map((entry) =>
          join(entry.parentPath, entry.name).slice(
            join(packageRoot, 'dist').length + 1,
          ),
        ),
    ].sort();
    return Promise.all(
      paths.map(async (path) => [
        path,
        await readFile(join(packageRoot, 'dist', path), 'utf8'),
      ]),
    );
  };

  const runGeneration = async (schema = SCHEMA) => {
    const response = await runAppWorker({
      request: { type: 'generateSourceClient', appPath, schema },
      signal: new AbortController().signal,
    });
    expect(response.isSnapshotHeld).toBe(false);
    return parseToolingResult({
      value: response.result,
      parseData: parseNullData,
    });
  };

  const installGenerator = async (contents: string) => {
    const manifest = JSON.parse(
      await readFile(join(packageRoot, 'package.json'), 'utf8'),
    );
    manifest.exports['./generate'] = './custom-generator.cjs';
    await writeFile(
      join(packageRoot, 'package.json'),
      JSON.stringify(manifest),
    );
    await writeFile(join(packageRoot, 'custom-generator.cjs'), contents);
    return join(packageRoot, 'custom-generator.cjs');
  };

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-cli-client-parity-'));
    await mkdir(join(root, 'node_modules'));
    for (const name of ['@sniptt', 'twenty-client-sdk', 'twenty-shared']) {
      await symlink(
        join(REPOSITORY_ROOT, 'node_modules', name),
        join(root, 'node_modules', name),
      );
    }
    const sdkSource = join(REPOSITORY_ROOT, 'packages/twenty-sdk/src');
    sdkEntryPath = join(root, 'sdk-reference.cjs');
    await build({
      stdin: {
        contents: `export { generateApplicationClient } from './application-build/generate-application-client';`,
        resolveDir: sdkSource,
      },
      outfile: sdkEntryPath,
      alias: { '@': sdkSource },
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'cjs',
      target: 'node24',
    });
    await buildTestAppWorker(join(root, 'reference'), {
      aliases: { '@/app/client/generate-application-client': sdkEntryPath },
    });
    await buildTestAppWorker(join(root, 'cli'));
    launch.modulePath = join(root, 'cli/app-worker.cjs');
  }, 60000);

  afterAll(async () => {
    await stop();
    await rm(root, { recursive: true, force: true });
  });

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-client-app-'));
    packageRoot = join(appPath, 'node_modules/twenty-client-sdk');
    await installTestClientSdk(packageRoot);
    await writeFile(join(packageRoot, 'dist/core.cjs'), 'old core client');
    await writeFile(join(packageRoot, 'dist/core.mjs'), 'old core client');
    await writeFile(join(packageRoot, 'dist/metadata.cjs'), 'metadata client');
    await writeFile(join(appPath, 'source.ts'), 'export const source = true;');
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('matches SDK-generated source and bundles byte for byte without an application SDK', async () => {
    launch.modulePath = join(root, 'reference/app-worker.cjs');
    const result = await runGeneration();
    launch.modulePath = join(root, 'cli/app-worker.cjs');
    expect(result).toEqual({
      success: true,
      data: null,
      diagnostics: [],
    });
    const expected = await readGeneratedClient();
    expect(await runGeneration()).toEqual({
      success: true,
      data: null,
      diagnostics: [],
    });
    expect(await readGeneratedClient()).toEqual(expected);
    expect(require(join(packageRoot, 'dist/core.cjs'))).toHaveProperty(
      'CoreApiClient',
    );
    expect(await readFile(join(packageRoot, 'dist/metadata.cjs'), 'utf8')).toBe(
      'metadata client',
    );
    expect(await readFile(join(appPath, 'source.ts'), 'utf8')).toBe(
      'export const source = true;',
    );
    expect((await readdir(appPath)).sort()).toEqual([
      'node_modules',
      'source.ts',
    ]);
  }, 15000);

  it.each(['not a schema', '', '   '])(
    'preserves the installed client for invalid schema %j',
    async (schema) => {
      expect(await runGeneration(schema)).toMatchObject({
        success: false,
        error: { code: 'CLIENT_GENERATION_FAILED' },
      });
      expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
        'old core client',
      );
      expect(await readFile(join(packageRoot, 'dist/core.mjs'), 'utf8')).toBe(
        'old core client',
      );
    },
  );

  it.each([null, {}, []])(
    'rejects a non-string schema from JavaScript callers: %j',
    async (schema) => {
      expect(
        await Reflect.apply(generateApplicationClient, undefined, [
          { appPath, schema },
        ]),
      ).toMatchObject({
        success: false,
        error: { code: 'CLIENT_GENERATION_FAILED' },
      });
    },
  );

  it('does not create a package when the dependency is missing', async () => {
    await rm(join(appPath, 'node_modules'), { recursive: true });
    expect(await runGeneration()).toMatchObject({
      success: false,
      error: { code: 'CLIENT_GENERATION_FAILED' },
    });
    expect(await readdir(appPath)).toEqual(['source.ts']);
  });

  it('does not write into a hoisted-only installation', async () => {
    const workspacePath = appPath;
    appPath = join(workspacePath, 'packages/app');
    try {
      await mkdir(appPath, { recursive: true });
      expect(await runGeneration()).toMatchObject({
        success: false,
        error: { code: 'CLIENT_GENERATION_FAILED' },
      });
      expect(await readdir(appPath)).toEqual([]);
      expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
        'old core client',
      );
    } finally {
      appPath = workspacePath;
    }
  });

  it.each(['null', '{"name":"other-package"}', '{'])(
    'rejects an invalid package manifest: %s',
    async (manifest) => {
      await writeFile(join(packageRoot, 'package.json'), manifest);
      expect(await runGeneration()).toMatchObject({
        success: false,
        error: { code: 'CLIENT_GENERATION_FAILED' },
      });
      expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
        'old core client',
      );
    },
  );

  it('requires the generate export of the same installed package', async () => {
    const manifest = JSON.parse(
      await readFile(join(packageRoot, 'package.json'), 'utf8'),
    );
    delete manifest.exports['./generate'];
    await writeFile(
      join(packageRoot, 'package.json'),
      JSON.stringify(manifest),
    );
    expect(await runGeneration()).toMatchObject({
      success: false,
      error: {
        code: 'CLIENT_GENERATION_FAILED',
        message: expect.stringContaining('own generate entry point'),
      },
    });
    expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
      'old core client',
    );
  });

  it('requires replaceCoreClient to be callable', async () => {
    await installGenerator('module.exports = { replaceCoreClient: false };');
    expect(await runGeneration()).toMatchObject({
      success: false,
      error: {
        code: 'CLIENT_GENERATION_FAILED',
        message: expect.stringContaining('must export replaceCoreClient'),
      },
    });
  });

  it('runs the app generator instead of the repository generator', async () => {
    await installGenerator(
      "exports.replaceCoreClient = async ({ packageRoot, schema }) => require('node:fs/promises').writeFile(require('node:path').join(packageRoot, 'dist/core.cjs'), schema);",
    );
    expect(await runGeneration()).toMatchObject({ success: true });
    expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
      SCHEMA,
    );
  });

  it('rejects a relative app path', async () => {
    expect(
      await generateApplicationClient({ appPath: '.', schema: SCHEMA }),
    ).toMatchObject({ success: false, error: { code: 'INVALID_APP_PATH' } });
  });

  it.each([undefined, 'Stopped by caller', Number.NaN])(
    'does not write when already cancelled with reason %s',
    async (reason) => {
      expect(
        await generateApplicationClient({
          appPath,
          schema: SCHEMA,
          signal: AbortSignal.abort(reason),
        }),
      ).toMatchObject({ success: false, error: { code: 'CANCELLED' } });
      expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
        'old core client',
      );
    },
  );

  it('waits for an in-flight generator to settle before reporting cancellation', async () => {
    const entry = await installGenerator(`
      let begin, finish;
      exports.started = new Promise(resolve => { begin = resolve; });
      const completed = new Promise(resolve => { finish = resolve; });
      exports.finish = () => finish();
      exports.replaceCoreClient = async ({ packageRoot }) => {
        begin(); await completed;
        await require('node:fs/promises').writeFile(require('node:path').join(packageRoot, 'dist/core.cjs'), 'finished client');
      };
    `);
    const generator = require(entry) as {
      started: Promise<void>;
      finish: () => void;
    };
    const controller = new AbortController();
    let settled = false;
    const operation = generateApplicationClient({
      appPath,
      schema: SCHEMA,
      signal: controller.signal,
    }).then((result) => {
      settled = true;
      return result;
    });
    await generator.started;
    controller.abort();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(settled).toBe(false);
    generator.finish();
    expect(await operation).toMatchObject({
      success: false,
      error: { code: 'CANCELLED' },
    });
    expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
      'finished client',
    );
  });

  it.each([false, true])(
    'preserves generator failures and partial writes with cancellation %s',
    async (shouldCancel) => {
      const entry = await installGenerator(`
      exports.cancel = () => {};
      exports.replaceCoreClient = async ({ packageRoot }) => {
        exports.cancel();
        await require('node:fs/promises').writeFile(require('node:path').join(packageRoot, 'dist/core.cjs'), 'partially replaced');
        throw new Error('Client compilation failed');
      };
    `);
      const generator = require(entry) as { cancel: () => void };
      const controller = new AbortController();
      if (shouldCancel) generator.cancel = () => controller.abort();
      expect(
        await generateApplicationClient({
          appPath,
          schema: SCHEMA,
          signal: controller.signal,
        }),
      ).toMatchObject({
        success: false,
        error: {
          code: 'CLIENT_GENERATION_FAILED',
          message: 'Client compilation failed',
        },
      });
      expect(await readFile(join(packageRoot, 'dist/core.cjs'), 'utf8')).toBe(
        'partially replaced',
      );
    },
  );
});
