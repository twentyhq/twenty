import { defineRole } from 'twenty-sdk/define';
import { MEDIA_NOTE_UNIVERSAL_IDENTIFIER } from '../objects/media-note.object';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '04981304-eca8-4757-9e9a-254390eafc79';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Media notes default role',
  description: 'Default role for the media notes example app',
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
      objectUniversalIdentifier: MEDIA_NOTE_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
