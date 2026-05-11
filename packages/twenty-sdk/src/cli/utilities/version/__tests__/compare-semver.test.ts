import { compareSemver } from '@/cli/utilities/version/compare-semver';

describe('compareSemver', () => {
  it('returns 0 for equal versions', () => {
    expect(compareSemver([2, 4, 0], [2, 4, 0])).toBe(0);
  });

  it('returns positive when a > b on major', () => {
    expect(compareSemver([3, 0, 0], [2, 99, 99])).toBeGreaterThan(0);
  });

  it('returns negative when a < b on minor', () => {
    expect(compareSemver([2, 3, 9], [2, 4, 0])).toBeLessThan(0);
  });

  it('returns negative when a < b on patch', () => {
    expect(compareSemver([2, 4, 0], [2, 4, 1])).toBeLessThan(0);
  });
});
