import { defineRole } from 'twenty-sdk';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '9238bc7b-d38f-4a1c-9d19-31ab7bc67a2f';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Hello world default function role',
  description: 'Hello world default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
