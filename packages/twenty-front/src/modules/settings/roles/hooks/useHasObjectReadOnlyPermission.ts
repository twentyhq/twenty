import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';
import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';

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
