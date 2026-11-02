import { t } from '@lingui/core/macro';
import {
  getAccessLevelFromObjectPermissionActions,
  type GrantAccessLevel,
  type ObjectPermissionAction,
} from 'twenty-shared/application';
import { RecordShareAccessLevel } from 'twenty-shared/types';

export const getGrantAccessLevelLabel = (accessLevel: GrantAccessLevel) => {
  switch (accessLevel) {
    case RecordShareAccessLevel.READ:
      return t`Read`;
    case RecordShareAccessLevel.READ_WRITE:
      return t`Read & write`;
    case RecordShareAccessLevel.FULL:
      return t`Full`;
  }
};

const getActionLabel = (action: ObjectPermissionAction) => {
  switch (action) {
    case 'canReadObjectRecords':
      return t`read`;
    case 'canUpdateObjectRecords':
      return t`update`;
    case 'canSoftDeleteObjectRecords':
      return t`delete`;
    case 'canDestroyObjectRecords':
      return t`destroy`;
  }
};

// Requested actions that match no level (update and delete without destroy) are shown as they are
export const getObjectPermissionActionsLabel = (
  actions: ObjectPermissionAction[],
): string => {
  const accessLevel = getAccessLevelFromObjectPermissionActions(actions);

  return accessLevel !== undefined
    ? getGrantAccessLevelLabel(accessLevel)
    : actions.map(getActionLabel).join(', ');
};
