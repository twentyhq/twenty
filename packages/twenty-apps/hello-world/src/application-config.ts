import { defineApplication } from 'twenty-sdk';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';

export default defineApplication({
  universalIdentifier: '489b3ba5-d9f3-4d6b-bcdd-beaa834ad57a',
  displayName: 'Hello World',
  description: 'A sample Twenty application',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
