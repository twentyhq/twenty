import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type CurrentUserWorkspaceObjectRecordsPermissions } from '@/auth/types/CurrentUserWorkspaceObjectRecordsPermissions';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentUserWorkspaceObjectRecordsPermissionsSelector =
  createAtomSelector<
    CurrentUserWorkspaceObjectRecordsPermissions[] | undefined
  >({
    key: 'currentUserWorkspaceObjectRecordsPermissionsSelector',
    get: ({ get }) => get(currentUserWorkspaceState)?.objectRecordsPermissions,
  });
