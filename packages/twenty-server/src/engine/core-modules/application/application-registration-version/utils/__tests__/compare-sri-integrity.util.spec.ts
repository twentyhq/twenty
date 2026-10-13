import { compareSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compare-sri-integrity.util';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

describe('compareSriIntegrity', () => {
  const integrity = computeSriIntegrity(Buffer.from('twenty'));
  const otherIntegrity = computeSriIntegrity(Buffer.from('tampered'));

  it('matches identical values', () => {
    expect(
      compareSriIntegrity({ expected: integrity, actual: integrity }),
    ).toBe('match');
  });

  it('matches when the expected value also lists weaker algorithms', () => {
    expect(
      compareSriIntegrity({
        expected: `sha1-AAA= ${integrity}`,
        actual: integrity,
      }),
    ).toBe('match');
  });

  it('reports differing digests of the same algorithm as a mismatch', () => {
    expect(
      compareSriIntegrity({ expected: integrity, actual: otherIntegrity }),
    ).toBe('mismatch');
  });

  it('compares on the strongest shared algorithm', () => {
    expect(
      compareSriIntegrity({
        expected: `sha256-AAA= ${integrity}`,
        actual: `sha256-AAA= ${otherIntegrity}`,
      }),
    ).toBe('mismatch');
  });

  it('cannot compare values that share no algorithm', () => {
    expect(
      compareSriIntegrity({ expected: 'sha1-AAA=', actual: integrity }),
    ).toBe('incomparable');
    expect(compareSriIntegrity({ expected: '', actual: integrity })).toBe(
      'incomparable',
    );
  });
});
