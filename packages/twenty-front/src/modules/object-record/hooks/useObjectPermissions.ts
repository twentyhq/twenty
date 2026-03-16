import { useMemo } from 'react';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type useObjectPermissionsReturnType = {
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};

const EMPTY_PERMISSIONS: Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
> = {};

export const useObjectPermissions = (): useObjectPermissionsReturnType => {
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const objectsPermissions = currentUserWorkspace?.objectsPermissions;

  // OMNIA-CUSTOM: Memoize the reduce result so callers get a stable reference.
  // This hook is called 300+ times per record table render (per row + per cell
  // via useIsRecordReadOnly). Without memoization, each call creates a new
  // object, causing unnecessary re-renders and cascading style recalculations
  // that crash mobile Safari.
  const objectPermissionsByObjectMetadataId = useMemo(() => {
    if (!isDefined(objectsPermissions)) {
      return EMPTY_PERMISSIONS;
    }

    return objectsPermissions.reduce(
      (
        acc: Record<string, ObjectPermissions & { objectMetadataId: string }>,
        objectPermission,
      ) => {
        acc[objectPermission.objectMetadataId] = objectPermission;
        return acc;
      },
      {},
    );
  }, [objectsPermissions]);

  return {
    objectPermissionsByObjectMetadataId,
  };
};
