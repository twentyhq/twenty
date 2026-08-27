import { defineApplication } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  author: 'Twenty',
  category: 'Productivity',
  websiteUrl: 'https://twenty.com',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  serverVariables: {
    FATHOM_CLIENT_ID: {
      description: 'OAuth client ID from the Twenty Fathom application.',
      isSecret: false,
      isRequired: true,
    },
    FATHOM_CLIENT_SECRET: {
      description: 'OAuth client secret from the Twenty Fathom application.',
      isSecret: true,
      isRequired: true,
    },
  },
});
