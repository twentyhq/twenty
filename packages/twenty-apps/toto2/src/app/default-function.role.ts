import { defineRole } from 'twenty-sdk';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER =
  'e9e54a48-5894-45c3-964e-24170808858b';

export default defineRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Toto 2 default function role',
  description: 'Toto 2 default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
