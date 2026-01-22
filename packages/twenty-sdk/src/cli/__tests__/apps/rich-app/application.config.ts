import { defineApp } from '@/application/define-app';
import { DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER } from './src/roles/default-function.role';

export default defineApp({
  universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
  displayName: 'Hello World',
  description: 'A simple hello world app',
  icon: 'IconWorld',
  applicationVariables: {
    DEFAULT_RECIPIENT_NAME: {
      universalIdentifier: '19e94e59-d4fe-4251-8981-b96d0a9f74de',
      description: 'Default recipient name for postcards',
      value: 'Alex Karp',
      isSecret: false,
    },
  },
  functionRoleUniversalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
});
