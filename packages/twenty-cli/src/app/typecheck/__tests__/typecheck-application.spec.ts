import { existsSync } from 'node:fs';
import {
  mkdir,
  mkdtemp,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
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
import { parseNullData, parseToolingResult } from '@/app/parse-tooling-result';
import { runAppWorker } from '@/app/run-app-worker';
import { typecheckApplication } from '@/app/typecheck/typecheck-application';

const launch = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));

vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => launch,
}));

const REPOSITORY_ROOT = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);
const require = createRequire(import.meta.url);
const compilerDirectory = dirname(require.resolve('typescript/package.json'));

describe('CLI typecheck matches the SDK with the same compiler', () => {
  let appPath: string;
  let referenceDirectory: string;
  let sdk: { typecheckApplication: typeof typecheckApplication };

  const checkWithWorker = async () => {
    const response = await runAppWorker({
      request: { type: 'typecheckSource', appPath },
      signal: new AbortController().signal,
    });
    expect(response.isSnapshotHeld).toBe(false);
    return parseToolingResult({
      value: response.result,
      parseData: parseNullData,
    });
  };

  const checkWithParity = async () => {
    const expected = await sdk.typecheckApplication({ appPath });
    const direct = await typecheckApplication({ appPath });
    const worker = await checkWithWorker();
    expect(direct).toEqual(expected);
    expect(worker).toEqual(expected);
    return worker;
  };

  beforeAll(async () => {
    referenceDirectory = await mkdtemp(
      join(tmpdir(), 'twenty-typecheck-reference-'),
    );
    await mkdir(join(referenceDirectory, 'node_modules'));
    for (const name of ['typescript', 'twenty-shared']) {
      await symlink(
        join(REPOSITORY_ROOT, 'node_modules', name),
        join(referenceDirectory, 'node_modules', name),
      );
    }
    const sdkSource = join(REPOSITORY_ROOT, 'packages/twenty-sdk/src');
    const entry = join(referenceDirectory, 'sdk-reference.cjs');
    await build({
      entryPoints: [
        join(sdkSource, 'application-build/typecheck-application.ts'),
      ],
      outfile: entry,
      alias: { '@': sdkSource },
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'cjs',
      target: 'node24',
    });
    sdk = require(entry) as typeof sdk;
    await buildTestAppWorker(join(referenceDirectory, 'cli'));
    launch.modulePath = join(referenceDirectory, 'cli/app-worker.cjs');
  }, 60000);

  afterAll(async () => {
    await stop();
    await rm(referenceDirectory, { recursive: true, force: true });
  });

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-typecheck-'));
    await mkdir(join(appPath, 'node_modules'));
    await symlink(compilerDirectory, join(appPath, 'node_modules/typescript'));
    await writeFile(
      join(appPath, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { strict: true, types: [], declaration: true },
        files: ['example.ts'],
      }),
    );
    await writeFile(join(appPath, 'example.ts'), 'export const value = 1;');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(appPath, { recursive: true, force: true });
  });

  it('checks valid code without emitting files or requiring an SDK', async () => {
    expect(await checkWithParity()).toEqual({
      success: true,
      data: null,
      diagnostics: [],
    });
    expect((await readdir(appPath)).sort()).toEqual([
      'example.ts',
      'node_modules',
      'tsconfig.json',
    ]);
  }, 15000);

  it('reports compiler errors with project-relative, one-based locations', async () => {
    await writeFile(
      join(appPath, 'example.ts'),
      'export const broken: number = "bad";',
    );
    expect(await checkWithParity()).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: [
        {
          severity: 'error',
          code: 'TS2322',
          file: 'example.ts',
          line: 1,
          column: 14,
        },
      ],
    });
  }, 15000);

  it('fails when tsconfig.json is missing', async () => {
    await rm(join(appPath, 'tsconfig.json'));
    expect(await checkWithParity()).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: [{ severity: 'error', code: 'TS5083' }],
    });
  });

  it.each([
    [
      'invalid option value',
      { compilerOptions: { target: 'invalid-target' } },
      'TS6046',
    ],
    ['unknown option', { compilerOptions: { invalidOption: true } }, 'TS5023'],
    ['missing extended config', { extends: './missing.json' }, 'TS5083'],
    ['no matching files', { include: ['missing/**/*.ts'] }, 'TS18003'],
  ])('fails on %s', async (_name, config, code) => {
    await writeFile(join(appPath, 'tsconfig.json'), JSON.stringify(config));
    expect(await checkWithParity()).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ severity: 'error', code }),
      ]),
    });
  });

  it('reports invalid JSON configuration', async () => {
    await writeFile(join(appPath, 'tsconfig.json'), '{ "compilerOptions": ');
    expect(await checkWithParity()).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: [expect.objectContaining({ severity: 'error' })],
    });
  });

  it('fails on unbuilt project references even without a source location', async () => {
    await mkdir(join(appPath, 'referenced'));
    await writeFile(
      join(appPath, 'referenced/source.ts'),
      'export const value = 1;',
    );
    await writeFile(
      join(appPath, 'referenced/tsconfig.json'),
      JSON.stringify({
        compilerOptions: { composite: true, outDir: 'dist', types: [] },
        files: ['source.ts'],
      }),
    );
    await writeFile(
      join(appPath, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { types: [] },
        files: ['referenced/source.ts'],
        references: [{ path: './referenced' }],
      }),
    );
    const result = await checkWithParity();
    expect(result).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ severity: 'error', code: 'TS6305' }),
      ]),
    });
    expect(
      result.diagnostics.find((diagnostic) => diagnostic.code === 'TS6305')
        ?.file,
    ).toBeUndefined();
    expect((await readdir(join(appPath, 'referenced'))).sort()).toEqual([
      'source.ts',
      'tsconfig.json',
    ]);
  }, 15000);

  it('fails clearly when the app compiler is missing, despite the CLI compiler being installed', async () => {
    await rm(join(appPath, 'node_modules/typescript'));
    expect(await checkWithWorker()).toMatchObject({
      success: false,
      error: {
        code: 'TYPESCRIPT_NOT_INSTALLED',
        message: expect.stringContaining(
          "Install typescript in the app's devDependencies",
        ),
      },
    });
  });

  it('does not borrow a compiler from NODE_PATH', async () => {
    await rm(join(appPath, 'node_modules/typescript'));
    vi.stubEnv('NODE_PATH', dirname(compilerDirectory));
    expect(await checkWithWorker()).toMatchObject({
      success: false,
      error: { code: 'TYPESCRIPT_NOT_INSTALLED' },
    });
  });

  it("explains unsupported Plug'n'Play resolution", async () => {
    await rm(join(appPath, 'node_modules/typescript'));
    await writeFile(join(appPath, '.pnp.cjs'), 'module.exports = {};');
    expect(await checkWithWorker()).toMatchObject({
      success: false,
      error: {
        code: 'TOOLING_UNSUPPORTED',
        message: expect.stringContaining('nodeLinker: node-modules'),
      },
    });
  });

  it('reports an incomplete compiler installation', async () => {
    await rm(join(appPath, 'node_modules/typescript'));
    await mkdir(join(appPath, 'node_modules/typescript'));
    await writeFile(
      join(appPath, 'node_modules/typescript/package.json'),
      JSON.stringify({
        name: 'typescript',
        version: '0.0.0',
        main: 'index.cjs',
      }),
    );
    await writeFile(
      join(appPath, 'node_modules/typescript/index.cjs'),
      'module.exports = {};',
    );
    expect(await checkWithWorker()).toMatchObject({
      success: false,
      error: {
        code: 'TOOLING_UNSUPPORTED',
        details: { compilerVersion: '0.0.0' },
      },
    });
  });

  it('resolves a workspace-hoisted compiler', async () => {
    const workspacePath = appPath;
    appPath = join(workspacePath, 'packages/app');
    try {
      await mkdir(appPath, { recursive: true });
      await writeFile(
        join(appPath, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: { types: [] },
          files: ['example.ts'],
        }),
      );
      await writeFile(join(appPath, 'example.ts'), 'export const value = 1;');
      expect(await checkWithParity()).toMatchObject({ success: true });
    } finally {
      appPath = workspacePath;
    }
  }, 15000);

  it('uses the actual app compiler version instead of the CLI compiler', async () => {
    await writeFile(
      join(appPath, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { module: 'node20', types: [] },
        files: ['example.ts'],
      }),
    );
    expect(await checkWithWorker()).toMatchObject({ success: true });
    await rm(join(appPath, 'node_modules/typescript'));
    await mkdir(join(appPath, 'node_modules/typescript'));
    const sdkRequire = createRequire(
      join(REPOSITORY_ROOT, 'packages/twenty-sdk/package.json'),
    );
    const legacyCompilerPath = sdkRequire.resolve('@ts-morph/common');
    await writeFile(
      join(appPath, 'node_modules/typescript/package.json'),
      JSON.stringify({ name: 'typescript', main: 'index.cjs' }),
    );
    await writeFile(
      join(appPath, 'node_modules/typescript/index.cjs'),
      `module.exports = require(${JSON.stringify(legacyCompilerPath)}).ts;`,
    );
    expect(await checkWithWorker()).toMatchObject({
      success: false,
      diagnostics: expect.arrayContaining([
        expect.objectContaining({
          code: 'TS6046',
          message: expect.stringContaining('--module'),
        }),
      ]),
    });
  }, 15000);

  it('returns structured cancellation before loading the app compiler', async () => {
    await rm(join(appPath, 'node_modules/typescript'));
    expect(
      await typecheckApplication({ appPath, signal: AbortSignal.abort() }),
    ).toMatchObject({ success: false, error: { code: 'CANCELLED' } });
  });

  it('terminates a compiler that cannot process cancellation', async () => {
    await rm(join(appPath, 'node_modules/typescript'));
    await mkdir(join(appPath, 'node_modules/typescript'));
    await writeFile(
      join(appPath, 'node_modules/typescript/package.json'),
      JSON.stringify({ name: 'typescript', main: 'index.cjs' }),
    );
    const marker = join(appPath, 'compiler-started');
    await writeFile(
      join(appPath, 'node_modules/typescript/index.cjs'),
      `const compiler = require(${JSON.stringify(require.resolve('typescript'))});
      module.exports = { ...compiler, getPreEmitDiagnostics() {
        require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'started');
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
      } };`,
    );
    const controller = new AbortController();
    const work = runAppWorker({
      request: { type: 'typecheckSource', appPath },
      signal: controller.signal,
    });
    const cancelled = expect(work).rejects.toMatchObject({ code: 'CANCELLED' });
    try {
      await vi.waitFor(() => expect(existsSync(marker)).toBe(true), {
        timeout: 5000,
      });
    } finally {
      controller.abort();
      await cancelled;
    }
    expect(existsSync(join(appPath, '.twenty'))).toBe(false);
  }, 15000);

  it('rejects relative application paths', async () => {
    expect(
      await typecheckApplication({ appPath: 'relative-app' }),
    ).toMatchObject({ success: false, error: { code: 'INVALID_APP_PATH' } });
  });
});
