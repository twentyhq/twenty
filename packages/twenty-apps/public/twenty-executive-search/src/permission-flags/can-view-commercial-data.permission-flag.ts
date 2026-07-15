import { definePermissionFlag } from 'twenty-sdk/define';

import { CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER } from 'src/constants/permission-flag-universal-identifiers';

export default definePermissionFlag({
  universalIdentifier: CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  key: 'CAN_VIEW_COMMERCIAL_DATA',
  label: 'View Commercial Data',
  description:
    'Grants read access to commercial, subscription, and payment fields (subscription_tier, plan_level, is_premium, stripe_customer_id, purchase_payment_history). Intended for finance and operations roles. Does not grant assessment or candidacy access.',
  icon: 'IconCash',
});
