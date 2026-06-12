import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'People Data Labs',
  description: 'Enrich People and Companies with People Data Labs data.',
  logoUrl: 'public/people-data-labs-icon.png',
  serverVariables: {
    PDL_API_KEY: {
      description: 'People Data Labs API key',
      isSecret: true,
      isRequired: true,
    },
  },
});
