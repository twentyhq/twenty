import { describe, expect, it } from 'vitest';

import { getEnginesTwentyRange } from '@/app/render-app-template';

describe('getEnginesTwentyRange', () => {
  it('returns minor lower bound for stable versions', () => {
    expect(getEnginesTwentyRange('0.50.2')).toBe('>=0.50.0');
    expect(getEnginesTwentyRange('1.10.3')).toBe('>=1.10.0');
  });

  it('includes prerelease tag when version is a pre-release', () => {
    expect(getEnginesTwentyRange('0.50.0-beta.1')).toBe('>=0.50.0-beta.1');
    expect(getEnginesTwentyRange('1.10.0-alpha.2')).toBe('>=1.10.0-alpha.2');
    expect(getEnginesTwentyRange('2.0.0-rc.0')).toBe('>=2.0.0-rc.0');
  });
});
