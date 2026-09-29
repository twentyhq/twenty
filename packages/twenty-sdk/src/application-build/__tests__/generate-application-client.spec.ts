import { createRequire } from 'node:module';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as clientGenerator from 'twenty-client-sdk/generate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateAppClient } from '@/application-build';

const SCHEMA = 'type Query { greeting: String }';

describe('generateAppClient', () => {
  let appPath: string;
  let packageRoot: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-generate-client-'));
    packageRoot = join(appPath, 'node_modules', 'twenty-client-sdk');
    await mkdir(join(packageRoot, 'dist'), { recursive: true });
    await writeFile(
      join(packageRoot, 'package.json'),
      JSON.stringify({ name: 'twenty-client-sdk' }),
    );
    await writeFile(join(packageRoot, 'dist', 'core.cjs'), 'old core client');
    await writeFile(join(packageRoot, 'dist', 'core.mjs'), 'old core client');
    await writeFile(
      join(packageRoot, 'dist', 'metadata.cjs'),
      'metadata client',
    );
    await writeFile(join(appPath, 'source.ts'), 'export const source = true;');
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(appPath, { recursive: true, force: true });
  });

  it('generates a usable client without changing app source or metadata client', async () => {
    expect(await generateAppClient({ appPath, schema: SCHEMA })).toEqual({
      success: true,
      data: null,
      diagnostics: [],
    });
    expect(
      await readFile(
        join(packageRoot, 'dist', 'core/generated/schema.graphql'),
        'utf8',
      ),
    ).toContain('greeting: String');
    expect(
      createRequire(import.meta.url)(join(packageRoot, 'dist', 'core.cjs')),
    ).toHaveProperty('CoreApiClient');
    expect(
      await readFile(join(packageRoot, 'dist', 'core.mjs'), 'utf8'),
    ).toContain('CoreApiClient');
    expect(
      await readFile(join(packageRoot, 'dist', 'metadata.cjs'), 'utf8'),
    ).toBe('metadata client');
    expect(await readFile(join(appPath, 'source.ts'), 'utf8')).toBe(
      'export const source = true;',
    );
    expect((await readdir(appPath)).sort()).toEqual([
      'node_modules',
      'source.ts',
    ]);
    expect(await readdir(join(packageRoot, 'dist', 'core'))).toEqual([
      'generated',
    ]);
  });

  it.each(['not a schema', ''])(
    'leaves the installed client unchanged for invalid schema: %s',
    async (schema) => {
      expect(await generateAppClient({ appPath, schema })).toMatchObject({
        success: false,
        error: { code: 'CLIENT_GENERATION_FAILED' },
      });
      expect(
        await readFile(join(packageRoot, 'dist', 'core.cjs'), 'utf8'),
      ).toBe('old core client');
      expect(
        await readFile(join(packageRoot, 'dist', 'core.mjs'), 'utf8'),
      ).toBe('old core client');
    },
  );

  it('does not create a partial package when the dependency is missing', async () => {
    await rm(join(appPath, 'node_modules'), { recursive: true });

    expect(await generateAppClient({ appPath, schema: SCHEMA })).toMatchObject({
      success: false,
      error: { code: 'CLIENT_GENERATION_FAILED' },
    });
    expect(await readdir(appPath)).toEqual(['source.ts']);
  });

  it.each([null, {}, []])(
    'rejects a non-string schema from JavaScript callers: %j',
    async (schema) => {
      expect(
        await Reflect.apply(generateAppClient, undefined, [
          { appPath, schema },
        ]),
      ).toMatchObject({
        success: false,
        error: { code: 'CLIENT_GENERATION_FAILED' },
      });
      expect((await readdir(join(packageRoot, 'dist'))).sort()).toEqual([
        'core.cjs',
        'core.mjs',
        'metadata.cjs',
      ]);
    },
  );

  it.each(['null', '{"name":"other-package"}', '{'])(
    'rejects an invalid installed package manifest: %s',
    async (manifest) => {
      await writeFile(join(packageRoot, 'package.json'), manifest);

      expect(
        await generateAppClient({ appPath, schema: SCHEMA }),
      ).toMatchObject({
        success: false,
        error: { code: 'CLIENT_GENERATION_FAILED' },
      });
      expect((await readdir(join(packageRoot, 'dist'))).sort()).toEqual([
        'core.cjs',
        'core.mjs',
        'metadata.cjs',
      ]);
    },
  );

  it('rejects a relative app path', async () => {
    expect(
      await generateAppClient({ appPath: '.', schema: SCHEMA }),
    ).toMatchObject({
      success: false,
      error: { code: 'INVALID_APP_PATH' },
    });
  });

  it.each([undefined, 'Stopped by caller', Number.NaN])(
    'does not write files when already cancelled with reason %s',
    async (reason) => {
      expect(
        await generateAppClient({
          appPath,
          schema: SCHEMA,
          signal: AbortSignal.abort(reason),
        }),
      ).toMatchObject({ success: false, error: { code: 'CANCELLED' } });
      expect((await readdir(join(packageRoot, 'dist'))).sort()).toEqual([
        'core.cjs',
        'core.mjs',
        'metadata.cjs',
      ]);
    },
  );

  it('waits for an in-flight generator to settle before reporting cancellation', async () => {
    const controller = new AbortController();
    let resolveStarted: (() => void) | undefined;
    let resolveFinish: (() => void) | undefined;
    const started = new Promise<void>((resolve) => {
      resolveStarted = resolve;
    });
    const finish = new Promise<void>((resolve) => {
      resolveFinish = resolve;
    });

    const replaceCoreClientSpy = vi
      .spyOn(clientGenerator, 'replaceCoreClient')
      .mockImplementation(async () => {
        resolveStarted?.();
        await finish;
        await writeFile(
          join(packageRoot, 'dist', 'core.cjs'),
          'finished client',
        );
      });

    let settled = false;
    const operation = generateAppClient({
      appPath,
      schema: SCHEMA,
      signal: controller.signal,
    }).then((result) => {
      settled = true;
      return result;
    });

    await started;
    controller.abort();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(settled).toBe(false);
    resolveFinish?.();

    expect(await operation).toMatchObject({
      success: false,
      error: { code: 'CANCELLED' },
    });
    expect(replaceCoreClientSpy).toHaveBeenCalledTimes(1);
    expect(replaceCoreClientSpy).toHaveBeenCalledWith({
      packageRoot,
      schema: SCHEMA,
    });
    expect(await readFile(join(packageRoot, 'dist', 'core.cjs'), 'utf8')).toBe(
      'finished client',
    );
  });

  it.each([false, true])(
    'preserves a generator failure and partial writes when cancellation is %s',
    async (shouldCancel) => {
      const controller = new AbortController();
      const replaceCoreClientSpy = vi
        .spyOn(clientGenerator, 'replaceCoreClient')
        .mockImplementation(async () => {
          if (shouldCancel) {
            controller.abort();
          }

          await writeFile(
            join(packageRoot, 'dist', 'core.cjs'),
            'partially replaced',
          );
          throw new Error('Client compilation failed');
        });

      expect(
        await generateAppClient({
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
      expect(replaceCoreClientSpy).toHaveBeenCalledTimes(1);
      expect(replaceCoreClientSpy).toHaveBeenCalledWith({
        packageRoot,
        schema: SCHEMA,
      });
      expect(
        await readFile(join(packageRoot, 'dist', 'core.cjs'), 'utf8'),
      ).toBe('partially replaced');
    },
  );
});
