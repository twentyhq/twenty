import { defineApplication } from 'twenty-sdk/define';

import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './my.role';

export default defineApplication({
  universalIdentifier: '01e065d6-1b48-4107-86d8-b06f87420a4f',
  displayName: 'Function Execute Test App',
  description: 'A minimal app for testing function:execute',
  icon: 'IconFunction',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
