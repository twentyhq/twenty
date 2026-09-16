import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
  defineRole,
} from 'twenty-sdk/define';

import { SLACK_ASSISTANT_READ_ONLY_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const READABLE_CRM_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
] as const;

export default defineRole({
  universalIdentifier: SLACK_ASSISTANT_READ_ONLY_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Slack Assistant (read-only)',
  description:
    'Read-only CRM access for the Slack conversational assistant in channels whose rule caps it at reading. Lets the slack-assistant-read-only agent read people, companies, opportunities, notes, tasks and workspace members, and nothing else. Tighten this role if you need an even narrower read-only bot.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: READABLE_CRM_OBJECT_UNIVERSAL_IDENTIFIERS.map(
    (objectUniversalIdentifier) => ({
      objectUniversalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    }),
  ),
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
});
