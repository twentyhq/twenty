import { definePermissionFlag } from 'twenty-sdk/define';

import { CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER } from 'src/constants/permission-flag-universal-identifiers';

export default definePermissionFlag({
  universalIdentifier: CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  key: 'CAN_BYPASS_COMMERCIAL_FIREWALL',
  label: 'Bypass Commercial Firewall',
  description:
    'Grants elevated override of commercial-selection firewall enforcement layers. Intended for compliance officers and managing partners performing audit or exception review.',
  icon: 'IconShieldOff',
});
