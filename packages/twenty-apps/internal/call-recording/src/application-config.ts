import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';
import { defineApplication } from 'twenty-sdk';

export default defineApplication({
  universalIdentifier: '4daa5147-7e70-4e43-b091-c27e1e8a32e3',
  displayName: 'Call recording',
  description: 'Allows to record calls',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
