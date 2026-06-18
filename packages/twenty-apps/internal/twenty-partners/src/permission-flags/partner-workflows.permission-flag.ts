import { SystemPermissionFlag } from 'twenty-sdk/define';

import { PARTNER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Lets the Partner role RUN the manual "Apply" workflow on a brief.
// NOTE (B7): WORKFLOWS is coarse — it also unlocks the workflow builder. Acceptable pre-B7;
// revisit in B7 (tighten, or swap Apply to a scoped command-menu-item + front-component).
export const PARTNER_WORKFLOWS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  SystemPermissionFlag.WORKFLOWS;

export const PARTNER_WORKFLOWS_ROLE_GRANT = {
  roleUniversalIdentifier: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  permissionFlagUniversalIdentifier: SystemPermissionFlag.WORKFLOWS,
  flag: 'WORKFLOWS',
} as const;
