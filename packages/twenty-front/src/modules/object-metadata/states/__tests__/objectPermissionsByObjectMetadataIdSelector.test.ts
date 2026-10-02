import { createStore } from 'jotai';

import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import { type CurrentUserWorkspaceObjectPermissions } from '@/auth/types/CurrentUserWorkspaceObjectPermissions';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const COMPANY_OBJECT_PERMISSIONS: ObjectPermissionsWithObjectMetadataId = {
  objectMetadataId: 'company-object-metadata-id',
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {
    'company-name-field-metadata-id': { canRead: true, canUpdate: false },
  },
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const PERSON_OBJECT_PERMISSIONS_WITH_UNSET_FLAGS: CurrentUserWorkspaceObjectPermissions =
  {
    objectMetadataId: 'person-object-metadata-id',
    canReadObjectRecords: false,
    canUpdateObjectRecords: null,
    restrictedFields: null,
  };

const buildCurrentUserWorkspace = (
  objectsPermissions: CurrentUserWorkspace['objectsPermissions'],
): CurrentUserWorkspace => ({
  permissionFlags: [],
  twoFactorAuthenticationMethodSummary: [],
  objectsPermissions,
  isImpersonating: false,
});

describe('objectPermissionsByObjectMetadataIdSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should be empty while the current user workspace is not loaded', () => {
    const store = createStore();

    store.set(currentUserWorkspaceState.atom, null);

    expect(store.get(objectPermissionsByObjectMetadataIdSelector.atom)).toEqual(
      {},
    );
  });

  it('should index the permissions of the current user by object metadata id', () => {
    const store = createStore();

    store.set(
      currentUserWorkspaceState.atom,
      buildCurrentUserWorkspace([COMPANY_OBJECT_PERMISSIONS]),
    );

    expect(store.get(objectPermissionsByObjectMetadataIdSelector.atom)).toEqual(
      {
        [COMPANY_OBJECT_PERMISSIONS.objectMetadataId]:
          COMPANY_OBJECT_PERMISSIONS,
      },
    );
  });

  it('should allow the flags the server left unset', () => {
    const store = createStore();

    store.set(
      currentUserWorkspaceState.atom,
      buildCurrentUserWorkspace([PERSON_OBJECT_PERMISSIONS_WITH_UNSET_FLAGS]),
    );

    expect(
      store.get(objectPermissionsByObjectMetadataIdSelector.atom)[
        'person-object-metadata-id'
      ],
    ).toEqual({
      objectMetadataId: 'person-object-metadata-id',
      canReadObjectRecords: false,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
  });

  it('should keep the same map when only the permission flags change', () => {
    const store = createStore();

    store.set(
      currentUserWorkspaceState.atom,
      buildCurrentUserWorkspace([COMPANY_OBJECT_PERMISSIONS]),
    );

    const initialObjectPermissionsByObjectMetadataId = store.get(
      objectPermissionsByObjectMetadataIdSelector.atom,
    );

    store.set(currentUserWorkspaceState.atom, {
      ...buildCurrentUserWorkspace([{ ...COMPANY_OBJECT_PERMISSIONS }]),
      permissionFlags: [PermissionFlagType.DATA_MODEL],
    });

    expect(store.get(objectPermissionsByObjectMetadataIdSelector.atom)).toBe(
      initialObjectPermissionsByObjectMetadataId,
    );
  });
});
