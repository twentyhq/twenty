import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineApplicationRole,
} from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: `${APP_DISPLAY_NAME} default role`,
  description:
    'Reads calendar events to match Google Meet conferences, and writes imported transcripts to Call Recordings.',
  recordsPermissions: {
    canReadAllRecords: false,
    canCreateAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    objects: [
      {
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent
            .universalIdentifier,
        canReadAllRecords: true,
      },
      {
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording
            .universalIdentifier,
        canReadAllRecords: true,
        canCreateAllRecords: true,
        canUpdateAllRecords: true,
      },
    ],
  },
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
});
