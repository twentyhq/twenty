import { defineRole } from '@/sdk';

export default defineRole({
  universalIdentifier: 'a1b2c3d4-e5f6-4000-8000-000000000002',
  label: 'Default role',
  description: 'Default role for function execute test app',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
});
