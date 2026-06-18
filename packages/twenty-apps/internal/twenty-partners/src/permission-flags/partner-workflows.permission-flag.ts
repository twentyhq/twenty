import { SystemPermissionFlag } from 'twenty-sdk/define';

// Lets the Partner role RUN the manual "Apply" workflow on a brief.
// NOTE (B7): WORKFLOWS is coarse — it also unlocks the workflow builder. Acceptable pre-B7;
// revisit in B7 (tighten, or swap Apply to a scoped command-menu-item + front-component).
export const PARTNER_WORKFLOWS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  SystemPermissionFlag.WORKFLOWS;
