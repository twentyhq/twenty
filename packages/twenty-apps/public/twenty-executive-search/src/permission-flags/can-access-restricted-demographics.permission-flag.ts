import { definePermissionFlag } from 'twenty-sdk/define';

import { CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER } from 'src/constants/permission-flag-universal-identifiers';

export default definePermissionFlag({
  universalIdentifier: CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  key: 'CAN_ACCESS_RESTRICTED_DEMOGRAPHICS',
  label: 'Access Restricted Demographics',
  description:
    'Grants access to restricted personal data (birthdate, gender, voluntary demographics, accommodation/medical info) for compliance reference. Intended for compliance officers only.',
  icon: 'IconLockAccess',
});
