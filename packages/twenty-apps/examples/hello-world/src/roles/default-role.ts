import { defineRole } from 'twenty-sdk';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'c38f4d11-760c-4d5c-89ed-e569c28b7b70';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Hello world default function role',
  description: 'Hello world default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
