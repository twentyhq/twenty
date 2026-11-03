import { defineRole } from 'twenty-sdk/define';

export default defineRole({
  universalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000102',
  label: 'Default role',
  description: 'Default role of the unmapped conditional availability app',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
});
