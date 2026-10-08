import { defineApplicationRole, SystemPermissionFlag } from 'twenty-sdk/define';

import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The single role of the Slack app: the ceiling for the app's own functions and
// the tool scope of the assistant agent (bound to this role). Read, update and
// soft-delete are opened across all objects so the agent, which always runs as
// the linked workspace member, is bounded by that member's own permissions
// rather than clipped to a fixed object list. Destroy and settings stay off as
// hard guardrails that hold even for an admin member; the one exception is
// destroying a Slack user link, which the linking functions need.
export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Slack tools role',
  description:
    'Everything the Slack app can do in the CRM. Tools only forward requests to Slack using the configured connected account. It reads, updates and soft-deletes records across the workspace, but never destroys them (apart from Slack user links) and never changes settings. The assistant agent runs as the linked workspace member who made the request, so a member’s own permissions apply within this ceiling, and an unlinked Slack user gets no answer.',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    // Read/update are already covered by the all-object grants above; the
    // linking functions additionally need to destroy a Slack user link.
    {
      objectUniversalIdentifier: SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: true,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.AI,
    SystemPermissionFlag.UPLOAD_FILE,
  ],
});
