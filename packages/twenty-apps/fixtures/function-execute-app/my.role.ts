import { defineRole } from 'twenty-sdk/define';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '9f992b6c-17e9-4381-bab5-b6150b574304';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
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
