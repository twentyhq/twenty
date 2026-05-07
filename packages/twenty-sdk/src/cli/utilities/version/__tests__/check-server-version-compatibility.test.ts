import {
  compareSemver,
  parseSemver,
} from '@/cli/utilities/version/check-server-version-compatibility';

describe('parseSemver', () => {
  it('parses a plain semver', () => {
    expect(parseSemver('1.2.3')).toEqual([1, 2, 3]);
  });

  it('strips a leading v', () => {
    expect(parseSemver('v2.4.0')).toEqual([2, 4, 0]);
  });

  it('returns null for "latest"', () => {
    expect(parseSemver('latest')).toBeNull();
  });

  it('returns null for a release-candidate tag', () => {
    expect(parseSemver('v2.4.0-rc')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseSemver('')).toBeNull();
  });
});

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
