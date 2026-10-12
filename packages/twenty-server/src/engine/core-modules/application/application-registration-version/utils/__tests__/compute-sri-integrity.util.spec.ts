import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { v4 } from 'uuid';

import {
  computeFileSriIntegrity,
  computeSriIntegrity,
} from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

describe('computeSriIntegrity', () => {
  it('returns the sha512 subresource integrity string of a buffer', () => {
    expect(computeSriIntegrity(Buffer.from('twenty'))).toBe(
      'sha512-3J0wPT8YOi3xpeIsR9N+Q8IWS0GEriFITzLxVSx0mSloLUDWVPuO20IsOGkvNbGOxNmg8zfSQJJcSklhz6paGg==',
    );
  });

  it('changes with the content', () => {
    expect(computeSriIntegrity(Buffer.from('a'))).not.toBe(
      computeSriIntegrity(Buffer.from('b')),
    );
  });

  it('hashes a file to the same value as its buffer', async () => {
    const filePath = join(tmpdir(), `sri-${v4()}.bin`);
    const content = Buffer.alloc(256 * 1024, 7);

    await fs.writeFile(filePath, content);

    try {
      expect(await computeFileSriIntegrity(filePath)).toBe(
        computeSriIntegrity(content),
      );
    } finally {
      await fs.rm(filePath, { force: true });
    }
  });
});
