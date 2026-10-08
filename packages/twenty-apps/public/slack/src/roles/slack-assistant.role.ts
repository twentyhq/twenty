import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
  defineRole,
} from 'twenty-sdk/define';

import { buildSlackCrmScopeObjectPermissions } from 'src/constants/slack-crm-scope';
import { SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const WORKSPACE_MEMBER_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier;

// This is the assistant's CRM scope, not an identity it takes on: the most the
// Slack assistant may ever touch. It is never used on its own — every request
// runs as the linked workspace member, so that member's own permissions apply
// within this scope and an unlinked user gets no answer. The object set mirrors
// the application role's CRM scope (both read from slack-crm-scope).
export default defineRole({
  universalIdentifier: SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Slack Assistant',
  description:
    'The CRM scope of the Slack assistant: the most it may ever read, create, update or soft-delete (people, companies, opportunities, notes and tasks; workspace members stay read-only). It is a ceiling, not an identity. Every request runs as the linked workspace member who made it, so that member’s own permissions apply within this scope, and an unlinked Slack user gets no answer.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    ...buildSlackCrmScopeObjectPermissions(),
    {
      objectUniversalIdentifier: WORKSPACE_MEMBER_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
});
