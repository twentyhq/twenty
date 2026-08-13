import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
  defineApplicationRole,
} from 'twenty-sdk/define';

import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Mirrors the read scope of the Slack Assistant role so link unfurls never
// expose more than the assistant itself can read.
const READABLE_CRM_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
] as const;

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Slack tools role',
  description:
    'Tools forward requests to Slack using the configured connected account, track assistant requests, and run the assistant agent. Read-only CRM access (people, companies, opportunities, notes, tasks) powers record link unfurls in Slack; write access is granted separately through the role assigned to the agent.',
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
    ...READABLE_CRM_OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      }),
    ),
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
});
