import { defineRole } from 'twenty-sdk';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER =
  '12582f9f-036a-40e4-8fe6-b1e126064d84';

export default defineRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Toto 1 default function role',
  description: 'Toto 1 default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
