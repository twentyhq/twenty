import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { isDefined, PermissionsOnAllObjectRecords } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useHasObjectReadOnlyPermission = () => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const isPermissionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );

  if (!isPermissionEnabled) {
    return false;
  }

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
