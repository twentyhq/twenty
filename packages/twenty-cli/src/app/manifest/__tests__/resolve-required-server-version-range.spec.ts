import { describe, expect, it } from 'vitest';

import { resolveRequiredServerVersionRange } from '@/app/manifest/resolve-required-server-version-range';

describe('resolveRequiredServerVersionRange', () => {
  it('should keep the declared range of an app without roles', () => {
    expect(
      resolveRequiredServerVersionRange({
        engineVersionRange: '>=2.19.0',
        hasRoles: false,
      }),
    ).toEqual({ requiredServerVersionRange: '>=2.19.0', warnings: [] });
  });

  it('should require the first server that reads recordsPermissions when the app declares no range', () => {
    expect(
      resolveRequiredServerVersionRange({
        engineVersionRange: null,
        hasRoles: true,
      }),
    ).toEqual({ requiredServerVersionRange: '>=2.59.0', warnings: [] });
  });

  it('should keep a declared range that already excludes older servers', () => {
    expect(
      resolveRequiredServerVersionRange({
        engineVersionRange: '>=2.59.0',
        hasRoles: true,
      }),
    ).toEqual({ requiredServerVersionRange: '>=2.59.0', warnings: [] });
  });

  it('should narrow a declared range that allows older servers and warn about it', () => {
    const { requiredServerVersionRange, warnings } =
      resolveRequiredServerVersionRange({
        engineVersionRange: '>=2.19.0',
        hasRoles: true,
      });

    expect(requiredServerVersionRange).toBe('>=2.19.0 >=2.59.0');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('raise engines.twenty');
  });

  it('should replace a range made of alternatives that allows older servers', () => {
    expect(
      resolveRequiredServerVersionRange({
        engineVersionRange: '^2.40.0 || ^3.0.0',
        hasRoles: true,
      }).requiredServerVersionRange,
    ).toBe('>=2.59.0');
  });
});
