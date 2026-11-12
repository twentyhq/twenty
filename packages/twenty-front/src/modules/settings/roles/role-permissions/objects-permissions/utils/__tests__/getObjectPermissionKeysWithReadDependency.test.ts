import { getObjectPermissionKeysWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionKeysWithReadDependency';

describe('getObjectPermissionKeysWithReadDependency', () => {
  it('should add See when a change is picked', () => {
    expect(
      getObjectPermissionKeysWithReadDependency({
        previousKeys: [],
        nextKeys: ['canSoftDeleteObjectRecords'],
      }),
    ).toEqual(['canReadObjectRecords', 'canSoftDeleteObjectRecords']);
  });

  it('should drop every change when See is dropped', () => {
    expect(
      getObjectPermissionKeysWithReadDependency({
        previousKeys: ['canReadObjectRecords', 'canUpdateObjectRecords'],
        nextKeys: ['canUpdateObjectRecords'],
      }),
    ).toEqual([]);
  });

  it('should keep the canonical order', () => {
    expect(
      getObjectPermissionKeysWithReadDependency({
        previousKeys: ['canReadObjectRecords'],
        nextKeys: ['canDestroyObjectRecords', 'canReadObjectRecords'],
      }),
    ).toEqual(['canReadObjectRecords', 'canDestroyObjectRecords']);
  });
});
