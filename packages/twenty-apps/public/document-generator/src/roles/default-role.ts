import { defineApplicationRole } from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The role the app's logic functions and agent run as. Scoped to least
// privilege: it only needs to read templates and CRM records and to create
// documents — it never deletes records, so delete capabilities stay off.
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
});
