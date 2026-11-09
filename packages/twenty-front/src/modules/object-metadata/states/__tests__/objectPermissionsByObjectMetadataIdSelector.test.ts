import { createStore } from 'jotai';

import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const COMPANY_OBJECT_RECORDS_PERMISSIONS: CurrentUserWorkspace['objectRecordsPermissions'][number] =
  {
    objectMetadataId: 'company-object-metadata-id',
    canCreateAllRecords: false,
    canReadAllRecords: true,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    unreadableFields: [],
    uneditableFields: ['company-name-field-metadata-id'],
  };

const PERSON_ROW_LEVEL_PERMISSION_PREDICATE: RowLevelPermissionPredicate = {
  id: 'person-predicate-id',
  fieldMetadataId: 'person-owner-field-metadata-id',
  objectMetadataId: 'person-object-metadata-id',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  workspaceMemberFieldMetadataId: 'workspace-member-id-field-metadata-id',
  workspaceMemberSubFieldName: null,
  roleId: 'role-id',
};

const PERSON_ROW_LEVEL_PERMISSION_PREDICATE_GROUP: RowLevelPermissionPredicateGroup =
  {
    id: 'person-predicate-group-id',
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
    objectMetadataId: 'person-object-metadata-id',
    parentRowLevelPermissionPredicateGroupId: null,
    positionInRowLevelPermissionPredicateGroup: null,
    canReadRecords: true,
    canUpdateRecords: true,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    roleId: 'role-id',
  };

const PERSON_OBJECT_RECORDS_PERMISSIONS_WITH_ROW_LEVEL_ACCESS: CurrentUserWorkspace['objectRecordsPermissions'][number] =
  {
    objectMetadataId: 'person-object-metadata-id',
    canCreateAllRecords: false,
    canReadAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    unreadableFields: [],
    uneditableFields: [],
    rowLevelRecordsPermissions: {
      canCreateRecords: true,
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      predicates: [PERSON_ROW_LEVEL_PERMISSION_PREDICATE],
      predicateGroups: [PERSON_ROW_LEVEL_PERMISSION_PREDICATE_GROUP],
    },
  };

const buildCurrentUserWorkspace = (
  objectRecordsPermissions: CurrentUserWorkspace['objectRecordsPermissions'],
): CurrentUserWorkspace => ({
  permissionFlags: [],
  twoFactorAuthenticationMethodSummary: [],
  objectRecordsPermissions,
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

  it('should derive the field lists from persisted restrictedFields', () => {
    const store = createStore();

    store.set(
      currentUserWorkspaceState.atom,
      buildCurrentUserWorkspace([
        {
          objectMetadataId: 'company-object-metadata-id',
          canCreateAllRecords: false,
          canReadAllRecords: true,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
          restrictedFields: {
            'unreadable-field-metadata-id': { canRead: false, canUpdate: null },
            'uneditable-field-metadata-id': { canRead: null, canUpdate: false },
            'unrestricted-field-metadata-id': {
              canRead: true,
              canUpdate: true,
            },
          },
        } as unknown as CurrentUserWorkspace['objectRecordsPermissions'][number],
      ]),
    );

    expect(
      store.get(objectPermissionsByObjectMetadataIdSelector.atom)[
        'company-object-metadata-id'
      ],
    ).toMatchObject({
      unreadableFields: ['unreadable-field-metadata-id'],
      uneditableFields: [
        'unreadable-field-metadata-id',
        'uneditable-field-metadata-id',
      ],
    });
  });

  it('should index the permissions of the current user by object metadata id', () => {
    const store = createStore();

    store.set(
      currentUserWorkspaceState.atom,
      buildCurrentUserWorkspace([COMPANY_OBJECT_RECORDS_PERMISSIONS]),
    );

    expect(store.get(objectPermissionsByObjectMetadataIdSelector.atom)).toEqual(
      {
        'company-object-metadata-id': {
          canCreateAllRecords: false,
          canReadAllRecords: true,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
          unreadableFields: [],
          uneditableFields: ['company-name-field-metadata-id'],
        },
      },
    );
  });

  it('should keep the row level permissions of the object', () => {
    const store = createStore();

    store.set(
      currentUserWorkspaceState.atom,
      buildCurrentUserWorkspace([
        PERSON_OBJECT_RECORDS_PERMISSIONS_WITH_ROW_LEVEL_ACCESS,
      ]),
    );

    expect(
      store.get(objectPermissionsByObjectMetadataIdSelector.atom)[
        'person-object-metadata-id'
      ],
    ).toEqual({
      canCreateAllRecords: false,
      canReadAllRecords: false,
      canUpdateAllRecords: false,
      canSoftDeleteAllRecords: false,
      canDestroyAllRecords: false,
      unreadableFields: [],
      uneditableFields: [],
      rowLevelRecordsPermissions:
        PERSON_OBJECT_RECORDS_PERMISSIONS_WITH_ROW_LEVEL_ACCESS.rowLevelRecordsPermissions,
    });
  });

  it('should keep the same map when only the permission flags change', () => {
    const store = createStore();

    store.set(
      currentUserWorkspaceState.atom,
      buildCurrentUserWorkspace([COMPANY_OBJECT_RECORDS_PERMISSIONS]),
    );

    const initialObjectPermissionsByObjectMetadataId = store.get(
      objectPermissionsByObjectMetadataIdSelector.atom,
    );

    store.set(currentUserWorkspaceState.atom, {
      ...buildCurrentUserWorkspace([{ ...COMPANY_OBJECT_RECORDS_PERMISSIONS }]),
      permissionFlags: [PermissionFlagType.DATA_MODEL],
    });

    expect(store.get(objectPermissionsByObjectMetadataIdSelector.atom)).toBe(
      initialObjectPermissionsByObjectMetadataId,
    );
  });
});
