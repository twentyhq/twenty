import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
  defineApplicationRole,
} from 'twenty-sdk/define';

import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TEAMS_ASSISTANT_CRM_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/features/chat/constants/teams-assistant-crm-object-universal-identifiers';
import {
  TEAMS_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/features/chat/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Microsoft Teams tools role',
  description:
    'Reads calendar events and their calendar channel associations to match Teams meetings, writes imported transcripts to Call Recordings, and writes the summary from the Teams Transcript Summarizer agent on them. Tracks assistant requests received from Teams, reads workspace members to match a Teams sender by email, keeps Teams user links so a matched sender is remembered and can be unlinked, and runs the Teams Assistant agent as that member, reading and editing people, companies, opportunities, notes and tasks within the permissions of that member. Chat tools only forward requests to Microsoft Teams using the configured bot credentials. Saves the Microsoft Teams settings of this workspace.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarChannelEventAssociation
          .universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
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
    {
      objectUniversalIdentifier:
        TEAMS_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: TEAMS_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: true,
    },
    ...TEAMS_ASSISTANT_CRM_OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: false,
      }),
    ),
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.AI,
    SystemPermissionFlag.APPLICATIONS,
  ],
});
