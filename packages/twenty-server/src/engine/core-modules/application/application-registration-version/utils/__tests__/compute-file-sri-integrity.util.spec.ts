import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { computeFileSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-file-sri-integrity.util';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

describe('computeFileSriIntegrity', () => {
  it('hashes every chunk of a file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'app-checksum-'));
    const filePath = join(directory, 'package.tgz');
    const buffer = Buffer.alloc(200000, 'x');

    try {
      await writeFile(filePath, buffer);
      expect(await computeFileSriIntegrity(filePath)).toBe(
        computeSriIntegrity({ source: buffer }),
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
