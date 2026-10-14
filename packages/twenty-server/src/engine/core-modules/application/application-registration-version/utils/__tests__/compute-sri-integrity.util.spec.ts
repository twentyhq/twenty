import { compareSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compare-sri-integrity.util';
import {
  computeSriIntegrity,
  computeSupportedSriIntegrity,
} from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

describe('computeSriIntegrity', () => {
  it('returns the sha512 subresource integrity string of a buffer', () => {
    expect(computeSriIntegrity({ source: Buffer.from('twenty') })).toBe(
      'sha512-3J0wPT8YOi3xpeIsR9N+Q8IWS0GEriFITzLxVSx0mSloLUDWVPuO20IsOGkvNbGOxNmg8zfSQJJcSklhz6paGg==',
    );
  });

  it('changes with the content', () => {
    expect(computeSriIntegrity({ source: Buffer.from('a') })).not.toBe(
      computeSriIntegrity({ source: Buffer.from('b') }),
    );
  });

  it('computes the digest of the requested algorithm', () => {
    expect(
      computeSriIntegrity({
        source: Buffer.from('twenty'),
        algorithm: 'sha256',
      }),
    ).toBe('sha256-fCxN90D3ILDIYZINwnaSxNS12qZdYzClk8kx01+Kxzc=');
  });
});

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
