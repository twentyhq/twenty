import { getCommandMenuContextApiObjectPermissions } from '@/command-menu-item/utils/getCommandMenuContextApiObjectPermissions';
import {
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicate,
} from 'twenty-shared/types';

const ROW_LEVEL_PERMISSION_PREDICATE: RowLevelPermissionPredicate = {
  id: 'predicate-id',
  fieldMetadataId: 'owner-field-metadata-id',
  objectMetadataId: 'person-object-metadata-id',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  workspaceMemberFieldMetadataId: 'workspace-member-id-field-metadata-id',
  workspaceMemberSubFieldName: null,
  roleId: 'role-id',
};

describe('getCommandMenuContextApiObjectPermissions', () => {
  it('should expose the reachable records permissions under the names read by availability expressions', () => {
    expect(
      getCommandMenuContextApiObjectPermissions({
        objectMetadataId: 'person-object-metadata-id',
        objectRecordsPermissions: {
          canCreateAllRecords: false,
          canReadAllRecords: false,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
          unreadableFields: [],
          uneditableFields: [],
          rowLevelRecordsPermissions: [
            {
              ruleId: 'rule-id',
              canCreateRecords: false,
              canReadRecords: true,
              canUpdateRecords: true,
              canSoftDeleteRecords: false,
              canDestroyRecords: false,
              predicates: [ROW_LEVEL_PERMISSION_PREDICATE],
              predicateGroups: [],
              unreadableFields: [],
              uneditableFields: [],
            },
          ],
        },
      }),
    ).toEqual({
      objectMetadataId: 'person-object-metadata-id',
      canCreateObjectRecords: false,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      unreadableFields: [],
      uneditableFields: [],
      rowLevelPermissionPredicates: [ROW_LEVEL_PERMISSION_PREDICATE],
      rowLevelPermissionPredicateGroups: [],
    });
  });
});
