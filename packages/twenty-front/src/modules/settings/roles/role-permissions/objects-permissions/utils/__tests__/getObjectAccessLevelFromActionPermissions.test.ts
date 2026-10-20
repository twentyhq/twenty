import { getObjectAccessLevelFromActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectAccessLevelFromActionPermissions';

describe('getObjectAccessLevelFromActionPermissions', () => {
  it('maps the four presets', () => {
    expect(
      getObjectAccessLevelFromActionPermissions({
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      }),
    ).toBe('NO_ACCESS');

    expect(
      getObjectAccessLevelFromActionPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      }),
    ).toBe('READ');

    expect(
      getObjectAccessLevelFromActionPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      }),
    ).toBe('EDIT');

    expect(
      getObjectAccessLevelFromActionPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
      }),
    ).toBe('EVERYTHING');
  });

  it('falls back to advanced for any other combination', () => {
    expect(
      getObjectAccessLevelFromActionPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: false,
      }),
    ).toBe('ADVANCED');

    expect(
      getObjectAccessLevelFromActionPermissions({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: false,
      }),
    ).toBe('ADVANCED');
  });
});
