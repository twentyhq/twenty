import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  author: 'Twenty',
  category: 'Product management',
  websiteUrl: 'https://github.com',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  serverVariables: {
    GITHUB_CLIENT_ID: {
      description: 'Client ID of the Twenty GitHub App.',
      isSecret: false,
      isRequired: true,
    },
    GITHUB_CLIENT_SECRET: {
      description: 'Client secret of the Twenty GitHub App.',
      isSecret: true,
      isRequired: true,
    },
  },
});
