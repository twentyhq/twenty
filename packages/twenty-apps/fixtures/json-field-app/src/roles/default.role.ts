import { defineApplicationRole } from 'twenty-sdk/define';

import { CHECKLIST_UNIVERSAL_IDENTIFIER } from '../objects/checklist.object';

export default defineApplicationRole({
  universalIdentifier: '8cf899b5-d461-46aa-a75e-902b01900f8d',
  label: 'JSON field test app default role',
  description: 'Lets the app read and write its own checklists',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: CHECKLIST_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    },
  ],
});
