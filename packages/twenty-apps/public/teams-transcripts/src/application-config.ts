import { defineApplication } from 'twenty-sdk/define';

import {
  MICROSOFT_CLIENT_ID_VARIABLE,
  MICROSOFT_CLIENT_SECRET_VARIABLE,
  MICROSOFT_TENANT_ID_VARIABLE,
} from 'src/constants/teams.constant';
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
  category: 'Productivity',
  websiteUrl: 'https://docs.twenty.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  serverVariables: {
    [MICROSOFT_TENANT_ID_VARIABLE]: {
      description:
        'Microsoft Entra tenant ID of the organization whose Teams transcripts are imported.',
      isSecret: false,
      isRequired: true,
    },
    [MICROSOFT_CLIENT_ID_VARIABLE]: {
      description:
        'Application (client) ID of the Entra app registration granted transcript permissions.',
      isSecret: false,
      isRequired: true,
    },
    [MICROSOFT_CLIENT_SECRET_VARIABLE]: {
      description: 'Client secret of the Entra app registration.',
      isSecret: true,
      isRequired: true,
    },
  },
});
