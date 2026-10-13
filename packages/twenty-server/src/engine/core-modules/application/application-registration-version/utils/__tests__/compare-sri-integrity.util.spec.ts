import { compareSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compare-sri-integrity.util';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

describe('compareSriIntegrity', () => {
  const integrity = computeSriIntegrity(Buffer.from('twenty'));
  const otherIntegrity = computeSriIntegrity(Buffer.from('tampered'));

  it('matches identical values', () => {
    expect(compareSriIntegrity(integrity, integrity)).toBe('match');
  });

  it('matches when the expected value also lists weaker algorithms', () => {
    expect(compareSriIntegrity(`sha1-AAA= ${integrity}`, integrity)).toBe(
      'match',
    );
  });

  it('reports differing digests of the same algorithm as a mismatch', () => {
    expect(compareSriIntegrity(integrity, otherIntegrity)).toBe('mismatch');
  });

  it('compares on the strongest shared algorithm', () => {
    expect(
      compareSriIntegrity(
        `sha256-AAA= ${integrity}`,
        `sha256-AAA= ${otherIntegrity}`,
      ),
    ).toBe('mismatch');
  });

  it('cannot compare values that share no algorithm', () => {
    expect(compareSriIntegrity('sha1-AAA=', integrity)).toBe('incomparable');
    expect(compareSriIntegrity('', integrity)).toBe('incomparable');
  });
});
