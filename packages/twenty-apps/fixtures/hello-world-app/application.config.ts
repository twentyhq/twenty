import { defineApplication } from 'twenty-sdk';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './src/roles/default-role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '6563e091-9f5b-4026-a3ea-7e3b3d09e218';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Hello world',
  description: '',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
