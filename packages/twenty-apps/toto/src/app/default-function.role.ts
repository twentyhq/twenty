import { defineRole } from 'twenty-sdk';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER =
  '18b5b1ef-af66-4c09-b1dd-bc60b9ea7cf8';

export default defineRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Toto default function role',
  description: 'Toto default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
