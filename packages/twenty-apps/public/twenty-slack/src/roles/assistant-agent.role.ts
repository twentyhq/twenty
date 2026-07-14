import { defineRole } from 'twenty-sdk/define';

import { SLACK_ASSISTANT_AGENT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Ships unassigned on purpose: an admin must explicitly assign this role (or a
// narrower one) to the Slack Assistant agent in Settings before the assistant
// can touch CRM data. Everyone who can reach the bot in Slack acts with the
// permissions of whatever role the agent holds.
export default defineRole({
  universalIdentifier: SLACK_ASSISTANT_AGENT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Slack Assistant agent role',
  description:
    'CRM read/write access for the Slack Assistant agent. Assign it to the Slack Assistant agent to enable answering from Slack; edit or replace it to narrow what the assistant can do.',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
