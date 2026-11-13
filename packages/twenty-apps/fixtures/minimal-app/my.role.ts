import { defineRole } from 'twenty-sdk/define';

export default defineRole({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000040',
  label: 'My role',
  description: 'A simple root-level role',
  recordsPermissions: {
    canReadAllRecords: true,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
  },
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
});
