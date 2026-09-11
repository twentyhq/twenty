import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { scanProjectSourceFiles } from '@/cli/utilities/pull/scan-project-source-files';

describe('scanProjectSourceFiles', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'scan-project-source-files-'));
    await mkdir(join(appPath, 'src', 'objects'), { recursive: true });
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should return a source file that defines no entity so its path stays reserved', async () => {
    await writeFile(
      join(appPath, 'src', 'objects', 'helpers.ts'),
      "export const PET_LABEL = 'Pet';\n",
    );

    const scannedFiles = await scanProjectSourceFiles(appPath);

    expect(scannedFiles).toEqual([
      {
        relativePath: join('src', 'objects', 'helpers.ts'),
        entityKey: null,
        universalIdentifier: null,
        isReadable: true,
      },
    ]);
  });
});
