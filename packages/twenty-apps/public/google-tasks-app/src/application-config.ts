import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Google tasks',
  description: 'App synchronizing tasks from Google tasks',
  logo: 'public/logo.svg',
  author: 'Twenty',
  category: 'Product management',
  emailSupport: 'contact@twenty.com',
  serverVariables: {
    GOOGLE_TASKS_CLIENT_ID: {
      description:
        'OAuth client ID issued by the third-party provider. Filled in once by the server admin on the application registration.',
      isSecret: false,
      isRequired: true,
    },
    GOOGLE_TASKS_CLIENT_SECRET: {
      description:
        'OAuth client secret issued by the third-party provider. Stored encrypted; never echoed in API responses.',
      isSecret: true,
      isRequired: true,
    },
  },
});
