import { defineApplication } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './roles/default-function.role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Postcard App',
  description: 'Send postcards easily with Twenty',
  icon: 'IconWorld',
  applicationVariables: {
    DEFAULT_RECIPIENT_NAME: {
      universalIdentifier: '19e94e59-d4fe-4251-8981-b96d0a9f74de',
      description: 'Default recipient name for postcards',
      value: 'Alex Karp',
      isSecret: false,
    },
  },
  serverVariables: {
    POSTCARD_API_KEY: {
      description: 'API key for the postcard printing service',
      isSecret: true,
      isRequired: true,
    },
    POSTCARD_SENDER_NAME: {
      description: 'Default sender name on postcards',
      isSecret: false,
      isRequired: false,
    },
  },
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
