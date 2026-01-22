import { defineRole } from 'twenty-sdk';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER =
  '9833a1f8-b3bc-4d28-9e80-f6b329abe8d1';

export default defineRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Toto default function role',
  description: 'Toto default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
