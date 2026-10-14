import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { v4 } from 'uuid';

import { computeFileSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-file-sri-integrity.util';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

describe('computeFileSriIntegrity', () => {
  it('hashes a file to the same value as its buffer', async () => {
    const filePath = join(tmpdir(), `sri-${v4()}.bin`);
    const content = Buffer.alloc(256 * 1024, 7);

    await fs.writeFile(filePath, content);

    try {
      expect(await computeFileSriIntegrity(filePath)).toBe(
        computeSriIntegrity({ source: content }),
      );
    } finally {
      await fs.rm(filePath, { force: true });
    }
  });
});
