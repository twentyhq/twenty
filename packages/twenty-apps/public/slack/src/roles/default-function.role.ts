import {
  defineApplicationRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
} from 'twenty-sdk/define';

import { buildSlackCrmScopeObjectPermissions } from 'src/constants/slack-crm-scope';
import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Slack tools role',
  description:
    'Everything the Slack app can do in the CRM. Tools only forward requests to Slack using the configured connected account. Tracks assistant requests, links Slack accounts to workspace members (which needs read access on workspace members for the email match), reads CRM records to render record link previews in Slack, and runs the assistant agent as the linked workspace member who made the request, bounded by this role, to create, update and soft-delete people, companies, opportunities, notes and tasks.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    {
      objectUniversalIdentifier:
        SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: true,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    ...buildSlackCrmScopeObjectPermissions(),
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.AI,
    SystemPermissionFlag.UPLOAD_FILE,
  ],
});
