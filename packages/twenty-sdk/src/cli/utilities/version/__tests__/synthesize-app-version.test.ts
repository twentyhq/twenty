import { afterEach, describe, expect, it, vi } from 'vitest';

import semver from 'semver';

import { synthesizeAppVersion } from '@/cli/utilities/version/synthesize-app-version';

describe('synthesizeAppVersion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GITHUB_SHA;
    delete process.env.CI_COMMIT_SHA;
  });

  it('produces a valid semver with the git short sha as build metadata', () => {
    process.env.GITHUB_SHA = 'a1b2c3d4e5f6';
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const version = synthesizeAppVersion();

    expect(version).toBe('0.0.1700000000000+a1b2c3d');
    expect(semver.valid(version)).not.toBeNull();
  });

  it('omits build metadata when no commit sha is available', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const version = synthesizeAppVersion();

    expect(version).toBe('0.0.1700000000000');
    expect(semver.valid(version)).not.toBeNull();
  });

  it('generates strictly increasing versions over time (ignoring build metadata)', () => {
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1_700_000_000_000)
      .mockReturnValueOnce(1_700_000_001_000);

    process.env.GITHUB_SHA = 'aaaaaaa';
    const earlier = synthesizeAppVersion();

    process.env.GITHUB_SHA = 'bbbbbbb';
    const later = synthesizeAppVersion();

    expect(semver.gt(later, earlier)).toBe(true);
  });
});
