import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'LinkedIn',
  description:
    'Bring LinkedIn conversations into Twenty. Each member connects their own LinkedIn account and their messages appear on the matching People and Companies.',
  logo: 'public/linkedin-logomark.svg',
  author: 'Twenty',
  category: 'Communication',
  emailSupport: 'contact@twenty.com',
  termsUrl: 'https://github.com/twentyhq/twenty?tab=License-1-ov-file#readme',
  websiteUrl: 'https://www.twenty.com',
  serverVariables: {
    UNIPILE_API_KEY: {
      description:
        'Account API key of the Unipile application LinkedIn accounts are connected through (dashboardv2.unipile.com).',
      isSecret: true,
      isRequired: true,
    },
    UNIPILE_WEBHOOK_SECRET: {
      description:
        'Signing secret of the Unipile webhook endpoint pointing at this app.',
      isSecret: true,
      isRequired: true,
    },
  },
});
