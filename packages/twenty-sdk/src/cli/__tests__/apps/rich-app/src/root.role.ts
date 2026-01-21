import { defineRole } from '@/application/roles/define-role';

export default defineRole({
  universalIdentifier: 'c0c1c2c3-c4c5-4000-8000-000000000001',
  label: 'Root role',
  description: 'A simple root-level role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
});
