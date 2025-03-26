import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const useHasObjectReadOnlyPermission = () => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  if (!isDefined(currentUserWorkspace?.objectRecordsPermissions)) {
    return false;
  }

  if (currentUserWorkspace?.objectRecordsPermissions.length === 0) {
    return true;
  }

  return (
    currentUserWorkspace?.objectRecordsPermissions.length === 1 &&
    currentUserWorkspace?.objectRecordsPermissions.includes(
      PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS,
    )
  );
};
