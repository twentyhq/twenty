import { type CurrentUserWorkspaceObjectRecordsPermissions } from '@/auth/types/CurrentUserWorkspaceObjectRecordsPermissions';

export type ObjectRecordsPermissionsWithObjectMetadataId =
  CurrentUserWorkspaceObjectRecordsPermissions & {
    canReadSomeRecords: boolean;
    canUpdateSomeRecords: boolean;
    canSoftDeleteSomeRecords: boolean;
    canDestroySomeRecords: boolean;
  };
