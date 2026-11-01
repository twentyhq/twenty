import { STUDIO_SESSION_LOCK_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-session-lock.object';
import { defineApplicationRole } from 'twenty-sdk/define';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER =
  '768730c3-a86d-4d3d-9042-748e330c3fb6';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'KATFIT Studio function role',
  description: 'Role used by KATFIT Studio application operations',
  objectPermissions: [{ objectUniversalIdentifier: STUDIO_SESSION_LOCK_OBJECT_UNIVERSAL_IDENTIFIER, canReadObjectRecords: true, canUpdateObjectRecords: true, canDestroyObjectRecords: true }],
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
});
