import { defineRole } from 'twenty-sdk/define';

export const BROKER_ROLE_UNIVERSAL_IDENTIFIER =
  'f5bf4e0c-a74f-4509-8d9b-802fc246ccc1';

export default defineRole({
  universalIdentifier: BROKER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Broker',
  description: 'Full access to the real estate workspace',
  icon: 'IconBuildingSkyscraper',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
});
