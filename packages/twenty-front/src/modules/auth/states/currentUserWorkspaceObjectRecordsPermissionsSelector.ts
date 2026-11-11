import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import { withFieldListsFromRestrictedFields } from '@/auth/utils/withFieldListsFromRestrictedFields';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const currentUserWorkspaceObjectRecordsPermissionsSelector =
  createAtomSelector<
    CurrentUserWorkspace['objectRecordsPermissions'] | undefined
  >({
    key: 'currentUserWorkspaceObjectRecordsPermissionsSelector',
    get: ({ get }) =>
      get(currentUserWorkspaceState)?.objectRecordsPermissions?.map(
        (objectRecordsPermissions) =>
          withFieldListsFromRestrictedFields(
            // TODO(@charlesBochet): remove once values persisted before 2.58 (single rule object) are gone
            isDefined(objectRecordsPermissions.rowLevelRecordsPermissions) &&
              !isArray(objectRecordsPermissions.rowLevelRecordsPermissions)
              ? {
                  ...objectRecordsPermissions,
                  rowLevelRecordsPermissions: null,
                }
              : objectRecordsPermissions,
          ),
      ),
  });
