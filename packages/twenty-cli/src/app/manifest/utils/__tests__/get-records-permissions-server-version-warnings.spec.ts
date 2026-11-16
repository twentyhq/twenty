import { describe, expect, it } from 'vitest';

import { getRecordsPermissionsServerVersionWarnings } from '@/app/manifest/utils/get-records-permissions-server-version-warnings';

const NEW_FORMAT_ROLE = {
  label: 'Sales',
  recordsPermissions: { canReadAllRecords: true },
};
const LEGACY_ROLE = { label: 'Support' };

describe('getRecordsPermissionsServerVersionWarnings', () => {
  it('should warn when a role declares recordsPermissions and an older server is allowed', () => {
    for (const requiredServerVersionRange of [null, '>=2.58.0', '^2.40.0']) {
      const warnings = getRecordsPermissionsServerVersionWarnings({
        roles: [NEW_FORMAT_ROLE, LEGACY_ROLE],
        requiredServerVersionRange,
      });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain(
        'recordsPermissions (declared by "Sales") is ignored',
      );
      expect(warnings[0]).toContain('">=2.59.0"');
    }
  });

  it('should not warn when every allowed server reads recordsPermissions', () => {
    for (const requiredServerVersionRange of ['>=2.59.0', '^2.60.1']) {
      expect(
        getRecordsPermissionsServerVersionWarnings({
          roles: [NEW_FORMAT_ROLE],
          requiredServerVersionRange,
        }),
      ).toEqual([]);
    }
  });

  it('should not warn when no role declares recordsPermissions', () => {
    expect(
      getRecordsPermissionsServerVersionWarnings({
        roles: [LEGACY_ROLE],
        requiredServerVersionRange: null,
      }),
    ).toEqual([]);
  });
});
