import { defineRole } from 'twenty-sdk';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'c1eadde3-a8e2-4652-968e-96ccacd591f5';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Hello World default function role',
  description: 'Hello World default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
