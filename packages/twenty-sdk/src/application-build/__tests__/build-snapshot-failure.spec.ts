import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compileApplication } from '@/cli/utilities/build/common/compile-application';
import { buildSnapshot } from '@/application-build/build-snapshot';

vi.mock('@/cli/utilities/build/common/compile-application', () => ({
  compileApplication: vi.fn(),
}));

describe('build snapshot failure diagnostics', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'tooling-failure-'));
  });

  afterEach(async () => {
    vi.resetAllMocks();
    await rm(appPath, { recursive: true, force: true });
  });

  it('retains warnings and existing files when artifact collection fails', async () => {
    const existingPaths = [
      join(appPath, 'keep.txt'),
      join(appPath, '.twenty', 'output', 'keep.txt'),
      join(appPath, '.twenty', 'snapshots', 'build-existing', 'keep.txt'),
    ];

    for (const filePath of existingPaths) {
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, 'existing content');
    }

    vi.mocked(compileApplication).mockImplementation(async ({ outputDir }) => {
      const directory = join(appPath, outputDir!);

      await mkdir(directory, { recursive: true });
      await writeFile(join(directory, 'manifest.json'), '{}');
      await writeFile(join(directory, 'package.json'), '{}');

      return {
        success: true,
        data: { manifest: {} as Manifest, builtFileInfos: new Map() },
        diagnostics: [
          {
            severity: 'warning',
            code: 'BUILD_WARNING',
            message: 'An optional translation was skipped',
          },
        ],
      };
    });

    expect(await buildSnapshot({ appPath })).toMatchObject({
      success: false,
      error: { code: 'BUILD_FAILED' },
      diagnostics: [
        {
          severity: 'warning',
          code: 'BUILD_WARNING',
          message: 'An optional translation was skipped',
        },
      ],
    });
    expect(await readdir(join(appPath, '.twenty', 'snapshots'))).toEqual([
      'build-existing',
    ]);

    for (const filePath of existingPaths) {
      expect(await readFile(filePath, 'utf8')).toBe('existing content');
    }
  });
});
