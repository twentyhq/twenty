import { defineRole } from 'twenty-sdk/define';

import {
  AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
  AMBASSADOR_OBJECT_PERMISSIONS,
  AMBASSADOR_REP_ROW_LEVEL_PERMISSION_PREDICATES,
} from './ambassador-row-permissions';

export const AMBASSADOR_REP_ROLE_ID = 'eaced098-426a-5e90-8a8a-0134cce1a439';

export default defineRole({
  universalIdentifier: AMBASSADOR_REP_ROLE_ID,
  label: 'Ambassador Rep',
  description:
    'Ambassador representative. Can read and update only records directly assigned to them. Row-level visibility enforced by the permission layer.',
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
  rowLevelPermissionPredicates: AMBASSADOR_REP_ROW_LEVEL_PERMISSION_PREDICATES,
});
