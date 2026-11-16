import { defineRole } from 'twenty-sdk/define';

export default defineRole({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000102',
  label: 'Shared dependencies app role',
  description: 'The default role of the shared dependencies app',
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
