import {
  defineRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
} from 'twenty-sdk/define';

export const WORKFLOW_ROLE_UNIVERSAL_IDENTIFIER =
  '3539c351-0dfe-4c1c-b21c-142bab48ed26';

export default defineRole({
  universalIdentifier: WORKFLOW_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Workflow gallery role',
  description:
    'Lets the gallery workflows manage demo companies, draft and send email, and create calendar events',
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
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
    },
  ],
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.SEND_EMAIL_TOOL,
    SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL,
  ],
});
