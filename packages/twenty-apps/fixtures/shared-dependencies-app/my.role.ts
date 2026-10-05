import { defineRole } from 'twenty-sdk/define';

export default defineRole({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000102',
  label: 'Shared dependencies app role',
  description: 'The default role of the shared dependencies app',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
});
