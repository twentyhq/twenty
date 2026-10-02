import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import {
  PermissionFlagType,
  WorkspaceActivationStatus,
} from '~/generated-metadata/graphql';

export const permissionFlagMapSelector = createAtomSelector<
  Record<PermissionFlagType, boolean>
>({
  key: 'permissionFlagMapSelector',
  areEqual: isDeeplyEqual,
  get: ({ get }) => {
    const grantedPermissionFlags = new Set(
      get(currentUserWorkspaceState)?.permissionFlags ?? [],
    );

    // Roles are not set up before the workspace is created, and the server lets settings calls through until then
    if (
      get(currentWorkspaceState)?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
    ) {
      grantedPermissionFlags.add(PermissionFlagType.WORKSPACE);
    }

    return Object.fromEntries(
      Object.values(PermissionFlagType).map((permissionFlag) => [
        permissionFlag,
        grantedPermissionFlags.has(permissionFlag),
      ]),
    ) as Record<PermissionFlagType, boolean>;
  },
});
