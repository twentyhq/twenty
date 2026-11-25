import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsWithReadDependency';

describe('getObjectOperationsWithReadDependency', () => {
  it('should add See when a change is picked', () => {
    expect(
      getObjectOperationsWithReadDependency({
        previousOperations: [],
        nextOperations: ['canSoftDeleteObjectRecords'],
      }),
    ).toEqual(['canReadObjectRecords', 'canSoftDeleteObjectRecords']);
  });

  it('should drop every change when See is dropped', () => {
    expect(
      getObjectOperationsWithReadDependency({
        previousOperations: ['canReadObjectRecords', 'canUpdateObjectRecords'],
        nextOperations: ['canUpdateObjectRecords'],
      }),
    ).toEqual([]);
  });

  it('should keep the canonical order', () => {
    expect(
      getObjectOperationsWithReadDependency({
        previousOperations: ['canReadObjectRecords'],
        nextOperations: ['canDestroyObjectRecords', 'canReadObjectRecords'],
      }),
    ).toEqual(['canReadObjectRecords', 'canDestroyObjectRecords']);
  });
});
