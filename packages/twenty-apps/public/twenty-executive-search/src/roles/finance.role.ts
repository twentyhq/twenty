import { defineRole } from 'twenty-sdk/define';

import { CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER } from 'src/constants/permission-flag-universal-identifiers';
import { FINANCE_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/role-universal-identifiers';

export default defineRole({
  universalIdentifier: FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Executive Search — Finance',
  description:
    'Finance and operations role. Can view commercial data (subscription_tier, plan_level, ' +
    'is_premium, stripe_customer_id, purchase_payment_history) via the CAN_VIEW_COMMERCIAL_DATA flag. ' +
    'Denied access to demographic, medical, and legacy-AI fields. No assessment or candidacy access.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [
    CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  ],
  // Field-level denies enforced via firewall registry; commercial fields readable per
  // CAN_VIEW_COMMERCIAL_DATA flag.
});
