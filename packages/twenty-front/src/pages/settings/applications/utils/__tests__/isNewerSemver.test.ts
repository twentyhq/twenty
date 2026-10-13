import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';

const isNumberedBetaNewer = () =>
  isNewerSemver('1.0.0-beta.11', '1.0.0-beta.2');

describe('isNewerSemver', () => {
  it.each([
    ['1.0.1', '1.0.0', true],
    ['1.1.0', '1.0.9', true],
    ['2.0.0', '1.99.99', true],
    ['1.0.0', '1.0.0', false],
    ['1.0.0', '1.0.1', false],
    ['0.9.0', '1.0.0', false],
  ])('compares %s against %s as newer=%s', (versionA, versionB, expected) => {
    expect(isNewerSemver(versionA, versionB)).toBe(expected);
  });

  it('treats missing segments as zero', () => {
    expect(isNewerSemver('1.1', '1.0.5')).toBe(true);
    expect(isNewerSemver('2', '1.9.9')).toBe(true);
    expect(isNewerSemver('1.0', '1.0.0')).toBe(false);
  });

  it('ranks a release above its own pre-releases', () => {
    expect(isNewerSemver('2.0.0', '2.0.0-beta.1')).toBe(true);
    expect(isNewerSemver('2.0.0-beta.1', '2.0.0')).toBe(false);
    expect(isNewerSemver('2.0.0-beta.2', '2.0.0-beta.1')).toBe(true);
    expect(isNewerSemver('2.0.0-beta.10', '2.0.0-beta.9')).toBe(true);
    expect(isNewerSemver('2.0.0-rc.1', '2.0.0-beta.9')).toBe(true);
    expect(isNewerSemver('2.0.0-beta.1', '1.9.0')).toBe(true);
  });

  it('orders pre-release identifiers like SemVer', () => {
    expect(isNewerSemver('1.0.0-beta.1a', '1.0.0-beta.2')).toBe(true);
    expect(isNewerSemver('1.0.0-beta.2', '1.0.0-beta.1a')).toBe(false);
    expect(isNewerSemver('1.0.0-beta', '1.0.0-alpha')).toBe(true);
    expect(isNewerSemver('1.0.0-Beta', '1.0.0-alpha')).toBe(false);
    expect(isNumberedBetaNewer()).toBe(true);
  });

  it('ignores build metadata and a leading v', () => {
    expect(isNewerSemver('1.0.0+build.2', '1.0.0+build.1')).toBe(false);
    expect(isNewerSemver('v1.2.0', '1.1.0')).toBe(true);
    expect(isNewerSemver(' 1.2.0 ', '1.1.0')).toBe(true);
  });

  it('never reports an update for malformed versions', () => {
    expect(isNewerSemver('latest', '1.0.0')).toBe(false);
    expect(isNewerSemver('1.0.0', 'latest')).toBe(false);
    expect(isNewerSemver('', '')).toBe(false);
    expect(isNewerSemver('a.b.c', '1.0.0')).toBe(false);
  });
});
