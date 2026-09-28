import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { tooling } from '@/tooling';

describe('tooling.typecheck', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-tooling-typecheck-'));
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
    await rm(appPath, { recursive: true, force: true });
  });

  it('checks valid code without emitting JavaScript or declarations', async () => {
    expect(await tooling.typecheck({ appPath })).toEqual({
      success: true,
      data: null,
      diagnostics: [],
    });
    expect((await readdir(appPath)).sort()).toEqual([
      'example.ts',
      'tsconfig.json',
    ]);
  });

  it('reports compiler errors with project-relative, one-based locations', async () => {
    await writeFile(
      join(appPath, 'example.ts'),
      'export const broken: number = "bad";',
    );

    expect(await tooling.typecheck({ appPath })).toMatchObject({
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
  });

  it('fails when tsconfig.json is missing', async () => {
    await rm(join(appPath, 'tsconfig.json'));

    expect(await tooling.typecheck({ appPath })).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: [{ severity: 'error', code: 'TS5083' }],
    });
  });

  it('fails on invalid compiler options', async () => {
    await writeFile(
      join(appPath, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { target: 'invalid-target' } }),
    );

    expect(await tooling.typecheck({ appPath })).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ severity: 'error', code: 'TS6046' }),
      ]),
    });
  });

  it('fails on unbuilt project references even without a source location', async () => {
    await mkdir(join(appPath, 'referenced'));
    await writeFile(
      join(appPath, 'referenced', 'source.ts'),
      'export const value = 1;',
    );
    await writeFile(
      join(appPath, 'referenced', 'tsconfig.json'),
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

    const result = await tooling.typecheck({ appPath });

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
  });

  it('returns a structured cancellation before checking', async () => {
    expect(
      await tooling.typecheck({ appPath, signal: AbortSignal.abort() }),
    ).toMatchObject({ success: false, error: { code: 'CANCELLED' } });
  });

  it('rejects relative application paths', async () => {
    expect(await tooling.typecheck({ appPath: 'relative-app' })).toMatchObject({
      success: false,
      error: { code: 'INVALID_APP_PATH' },
    });
  });
});
