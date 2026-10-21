import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';
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
    const permissionFlagMap = buildRecordFromKeysWithSameValue(
      Object.values(PermissionFlagType),
      false,
    );

    for (const permissionFlag of get(currentUserWorkspaceState)
      ?.permissionFlags ?? []) {
      permissionFlagMap[permissionFlag] = true;
    }

    // Roles are not set up before the workspace is created, and the server lets settings calls through until then
    if (
      get(currentWorkspaceState)?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
    ) {
      permissionFlagMap[PermissionFlagType.WORKSPACE] = true;
    }

    return permissionFlagMap;
  },
});
