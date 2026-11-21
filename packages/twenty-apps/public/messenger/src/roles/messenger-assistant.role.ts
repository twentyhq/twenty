import {
  defineRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MESSENGER_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// records the assistant links conversations to and writes summaries on
const READ_AND_UPDATE_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget.universalIdentifier,
];

export default defineRole({
  universalIdentifier: MESSENGER_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Messenger assistant',
  description:
    'Lets the Messenger assistant read people, companies and opportunities, link Messenger conversations to them, and write summaries as notes and follow-ups as tasks. Messages are read and sent through the Messenger tools.',
  recordsPermissions: {
    canReadAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    objects: READ_AND_UPDATE_OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadAllRecords: true,
        canUpdateAllRecords: true,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
      }),
    ),
  },
  canUpdateAllSettings: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: false,
  canAccessAllTools: false,
  permissionFlagUniversalIdentifiers: [],
});
