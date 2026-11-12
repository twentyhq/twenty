import { getDeprecatedRecordsPermissionsWarnings } from '@/sdk/define/roles/get-deprecated-records-permissions-warnings';

describe('getDeprecatedRecordsPermissionsWarnings', () => {
  it('should not warn for a role written with recordsPermissions only', () => {
    expect(
      getDeprecatedRecordsPermissionsWarnings({
        label: 'Sales',
        role: { objectPermissions: [], fieldPermissions: undefined },
      }),
    ).toEqual([]);
  });

  it('should name the deprecated properties a role uses', () => {
    const warnings = getDeprecatedRecordsPermissionsWarnings({
      label: 'Sales',
      role: {
        canReadAllObjectRecords: false,
        objectPermissions: [{ objectUniversalIdentifier: 'company' }],
        rowLevelPermissionPredicates: [],
      },
    });

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain(
      'Role "Sales" uses deprecated properties: canReadAllObjectRecords, objectPermissions.',
    );
  });
});
