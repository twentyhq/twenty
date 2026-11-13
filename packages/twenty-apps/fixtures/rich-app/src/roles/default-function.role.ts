import { SystemPermissionFlag, defineRole } from 'twenty-sdk/define';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  POST_CARD_UNIVERSAL_IDENTIFIER,
} from '../objects/post-card.object';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'b648f87b-1d26-4961-b974-0908fd991061';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Default function role',
  description: 'Default role for function Twenty client',
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  recordsPermissions: {
    canReadAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    objects: [
      {
        objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
        canReadAllRecords: true,
        canUpdateAllRecords: true,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
        unreadableFields: [CONTENT_FIELD_UNIVERSAL_IDENTIFIER],
        uneditableFields: [CONTENT_FIELD_UNIVERSAL_IDENTIFIER],
      },
      {
        objectUniversalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
        canReadAllRecords: true,
        canUpdateAllRecords: true,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
      },
    ],
  },
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.APPLICATIONS],
});
