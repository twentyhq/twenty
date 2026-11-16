import { createHash } from 'crypto';

import { assertMatchingTarballIntegrity } from 'src/engine/core-modules/application/application-package/utils/assert-matching-tarball-integrity.util';

const TARBALL = Buffer.from('tarball bytes');
const INTEGRITY = `sha512-${createHash('sha512').update(TARBALL).digest('base64')}`;

describe('assertMatchingTarballIntegrity', () => {
  it('accepts a tarball matching the sha512 integrity', () => {
    expect(() =>
      assertMatchingTarballIntegrity({
        tarball: TARBALL,
        integrity: `sha1-ignored ${INTEGRITY}`,
      }),
    ).not.toThrow();
  });

  it('rejects a tarball with different bytes', () => {
    expect(() =>
      assertMatchingTarballIntegrity({
        tarball: Buffer.from('other bytes'),
        integrity: INTEGRITY,
      }),
    ).toThrow('does not match');
  });

  it('rejects an integrity without a sha512 hash', () => {
    expect(() =>
      assertMatchingTarballIntegrity({
        tarball: TARBALL,
        integrity: 'sha1-abc',
      }),
    ).toThrow('does not match');
  });
});
