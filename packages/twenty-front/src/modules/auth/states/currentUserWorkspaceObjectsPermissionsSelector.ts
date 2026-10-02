import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type CurrentUserWorkspaceObjectPermissions } from '@/auth/types/CurrentUserWorkspaceObjectPermissions';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentUserWorkspaceObjectsPermissionsSelector =
  createAtomSelector<CurrentUserWorkspaceObjectPermissions[] | undefined>({
    key: 'currentUserWorkspaceObjectsPermissionsSelector',
    get: ({ get }) => get(currentUserWorkspaceState)?.objectsPermissions,
  });
