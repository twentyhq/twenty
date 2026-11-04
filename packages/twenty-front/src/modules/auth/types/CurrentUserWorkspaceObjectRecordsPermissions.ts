import {
  type RestrictedFieldsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';

export type CurrentUserWorkspaceObjectRecordsPermissions = {
  objectMetadataId: string;
  canReadAllRecords: boolean;
  canUpdateAllRecords: boolean;
  canSoftDeleteAllRecords: boolean;
  canDestroyAllRecords: boolean;
  restrictedFields: RestrictedFieldsPermissions;
  rowLevelRecordsPermissions?: {
    canReadRecords: boolean;
    canUpdateRecords: boolean;
    canSoftDeleteRecords: boolean;
    canDestroyRecords: boolean;
    predicates: RowLevelPermissionPredicate[];
    predicateGroups: RowLevelPermissionPredicateGroup[];
  } | null;
};
