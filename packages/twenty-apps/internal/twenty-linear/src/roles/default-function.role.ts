import { defineRole } from 'twenty-sdk/define';

import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// The Linear logic functions never read workspace data — they only call
// Linear's GraphQL API on behalf of the connected user.
export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Linear function role',
  description: 'No-op role for Linear logic functions',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [],
  fieldPermissions: [],
  permissionFlags: [],
});
