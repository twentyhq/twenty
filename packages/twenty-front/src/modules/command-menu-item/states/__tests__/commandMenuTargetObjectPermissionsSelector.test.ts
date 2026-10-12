import { createStore } from 'jotai';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { commandMenuTargetObjectPermissionsSelector } from '@/command-menu-item/states/commandMenuTargetObjectPermissionsSelector';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

describe('commandMenuTargetObjectPermissionsSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should read the role permissions of each object by singular name', () => {
    const store = createStore();

    setTestObjectMetadataItemsInMetadataStore(store, objectMetadataItems);
    store.set(currentUserWorkspaceState.atom, {
      permissionFlags: [],
      twoFactorAuthenticationMethodSummary: [],
      objectsPermissions: [
        {
          objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
        {
          objectMetadataId: getMockObjectMetadataItemOrThrow('opportunity').id,
          canReadObjectRecords: false,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      ],
      isImpersonating: false,
    });

    const { targetObjectReadPermissions, targetObjectWritePermissions } =
      store.get(commandMenuTargetObjectPermissionsSelector.atom);

    expect(targetObjectReadPermissions.company).toBe(true);
    expect(targetObjectWritePermissions.company).toBe(false);
    expect(targetObjectReadPermissions.opportunity).toBe(false);
    expect(targetObjectWritePermissions.opportunity).toBe(false);
  });

  it('should allow objects missing from the role permissions', () => {
    const store = createStore();

    setTestObjectMetadataItemsInMetadataStore(store, objectMetadataItems);
    store.set(currentUserWorkspaceState.atom, {
      permissionFlags: [],
      twoFactorAuthenticationMethodSummary: [],
      objectsPermissions: [],
      isImpersonating: false,
    });

    const { targetObjectReadPermissions, targetObjectWritePermissions } =
      store.get(commandMenuTargetObjectPermissionsSelector.atom);

    expect(Object.keys(targetObjectReadPermissions)).toHaveLength(
      objectMetadataItems.length,
    );
    expect(targetObjectReadPermissions.person).toBe(true);
    expect(targetObjectWritePermissions.person).toBe(true);
  });
});
