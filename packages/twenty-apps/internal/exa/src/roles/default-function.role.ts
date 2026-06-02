import { defineRole } from 'twenty-sdk/define';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '9a55f3d2-f87c-4f1b-a0f3-5d1c6b8a2e4c';

// Exa's logic function never reads workspace data — it only reads
// EXA_API_KEY and calls Exa's external API — so the role needs no object
// permissions. Kept explicit so the manifest records the "zero data
// access" posture.
export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Exa function role',
  description: 'No-op role for the exa_web_search logic function',
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
