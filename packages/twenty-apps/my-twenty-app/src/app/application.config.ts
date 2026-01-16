import { defineApp } from 'twenty-sdk';
import { DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER } from './default-function.role';

export default defineApp({
  universalIdentifier: '66f75ddb-ec77-4812-9484-d7f92367f41b',
  displayName: 'invoicing',
  description: 'an app to generate invoices',
  functionRoleUniversalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
});
