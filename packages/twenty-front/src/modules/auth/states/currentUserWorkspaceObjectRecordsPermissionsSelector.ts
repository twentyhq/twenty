import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import { normalizePersistedObjectRecordsPermissions } from '@/auth/utils/normalizePersistedObjectRecordsPermissions';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentUserWorkspaceObjectRecordsPermissionsSelector =
  createAtomSelector<
    CurrentUserWorkspace['objectRecordsPermissions'] | undefined
  >({
    key: 'currentUserWorkspaceObjectRecordsPermissionsSelector',
    get: ({ get }) =>
      get(currentUserWorkspaceState)?.objectRecordsPermissions?.map(
        normalizePersistedObjectRecordsPermissions,
      ),
  });
