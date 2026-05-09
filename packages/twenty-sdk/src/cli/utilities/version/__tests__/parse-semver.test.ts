import { parseSemver } from '@/cli/utilities/version/parse-semver';

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
