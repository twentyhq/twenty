import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentUserWorkspaceObjectRecordsPermissionsSelector =
  createAtomSelector<
    CurrentUserWorkspace['objectRecordsPermissions'] | undefined
  >({
    key: 'currentUserWorkspaceObjectRecordsPermissionsSelector',
    get: ({ get }) => get(currentUserWorkspaceState)?.objectRecordsPermissions,
  });
