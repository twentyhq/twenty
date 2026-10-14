import { compareSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compare-sri-integrity.util';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import { computeSupportedSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-supported-sri-integrity.util';

describe('computeSupportedSriIntegrity', () => {
  const content = Buffer.from('twenty');

  it('lists a digest for every supported algorithm', () => {
    expect(computeSupportedSriIntegrity(content).split(' ')).toEqual([
      computeSriIntegrity({ source: content, algorithm: 'sha512' }),
      computeSriIntegrity({ source: content, algorithm: 'sha384' }),
      computeSriIntegrity({ source: content, algorithm: 'sha256' }),
    ]);
  });

  it('can be compared with an attestation that only uses a weaker supported algorithm', () => {
    const actual = computeSupportedSriIntegrity(content);

    expect(
      compareSriIntegrity({
        expected: computeSriIntegrity({ source: content, algorithm: 'sha256' }),
        actual,
      }),
    ).toBe('match');
    expect(
      compareSriIntegrity({
        expected: computeSriIntegrity({
          source: Buffer.from('tampered'),
          algorithm: 'sha384',
        }),
        actual,
      }),
    ).toBe('mismatch');
  });
});
