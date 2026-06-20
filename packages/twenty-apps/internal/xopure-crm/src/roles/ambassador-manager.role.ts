import { defineRole } from 'twenty-sdk/define';

import {
  AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
  AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS,
  AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES,
  AMBASSADOR_OBJECT_PERMISSIONS,
} from './ambassador-row-permissions';

export const AMBASSADOR_MANAGER_ROLE_ID =
  'f9d06652-db4d-51d0-84ff-b4e233934ed4';

const managerRoleConfig = {
  universalIdentifier: AMBASSADOR_MANAGER_ROLE_ID,
  label: 'Ambassador Manager',
  description:
    'Ambassador team manager. Can read and update records assigned to their supervised ambassadors. Row-level visibility enforced by the permission layer.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
  objectPermissions: AMBASSADOR_OBJECT_PERMISSIONS,
  fieldPermissions: AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
  rowLevelPermissionPredicateGroups:
    AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS,
  rowLevelPermissionPredicates:
    AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES,
};

export default defineRole(
  managerRoleConfig as Parameters<typeof defineRole>[0],
);
