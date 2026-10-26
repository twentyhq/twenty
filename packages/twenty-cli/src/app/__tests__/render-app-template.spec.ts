import semver from 'semver';
import { describe, expect, it } from 'vitest';

import { getEnginesTwentyRequirement } from '@/app/render-app-template';

describe('getEnginesTwentyRequirement', () => {
  it('generates standard minor range for stable versions', () => {
    expect(getEnginesTwentyRequirement('2.52.0')).toBe('>=2.52.0');
    expect(getEnginesTwentyRequirement('1.10.4')).toBe('>=1.10.0');
  });

  it('generates prerelease-compatible range for prerelease versions', () => {
    expect(getEnginesTwentyRequirement('1.10.0-alpha.1')).toBe('>=1.10.0-0');
    expect(getEnginesTwentyRequirement('2.53.0-rc.0')).toBe('>=2.53.0-0');
    expect(getEnginesTwentyRequirement('0.1.0-canary.20261026')).toBe(
      '>=0.1.0-0',
    );
  });

  it('allows matching prerelease SDK/server versions within the minor release', () => {
    const range = getEnginesTwentyRequirement('1.10.0-alpha.1');

    expect(semver.satisfies('1.10.0-alpha.1', range)).toBe(true);
    expect(semver.satisfies('1.10.0-beta.0', range)).toBe(true);
    expect(semver.satisfies('1.10.0', range)).toBe(true);
    expect(semver.satisfies('1.10.1', range)).toBe(true);
    expect(semver.satisfies('1.9.9', range)).toBe(false);
  });
});
