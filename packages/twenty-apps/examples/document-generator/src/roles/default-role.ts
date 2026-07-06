import { defineApplicationRole, SystemPermissionFlag } from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The role the app's logic functions and agent run as. Scoped to least
// privilege: it reads templates and CRM records, creates documents, and uploads
// the generated PDF — it never deletes records, so delete capabilities stay off.
export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: `${APP_DISPLAY_NAME} default role`,
  description: `${APP_DISPLAY_NAME} default role`,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canAccessAllTools: true,
  canBeAssignedToAgents: true,
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.UPLOAD_FILE],
});
