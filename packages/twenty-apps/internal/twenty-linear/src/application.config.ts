import { defineApplication } from 'twenty-sdk/define';
import { ABOUT_DESCRIPTION } from './constants/ABOUT_DESCRIPTION.md';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Linear',
  description:
    'Connect Linear to Twenty. Each workspace member connects their own Linear account; logic functions can then create issues and read team data on their behalf.',
  logoUrl: 'public/linear-logomark.svg',
  aboutDescription: ABOUT_DESCRIPTION,
  applicationVariables: undefined,
  author: 'Twenty',
  category: 'Product management',
  emailSupport: 'contact@twenty.com',
  screenshots: [
    'public/gallery/command-menu-item-1.png',
    'public/gallery/command-menu-item-2.png',
    'public/gallery/command-menu-item-3.png',
    'public/gallery/command-menu-item-4.png',
  ],
  termsUrl: 'https://github.com/twentyhq/twenty?tab=License-1-ov-file#readme',
  websiteUrl: 'https://www.twenty.com',
  serverVariables: {
    LINEAR_CLIENT_ID: {
      description:
        'OAuth client ID from your Linear OAuth application (linear.app/settings/api/applications).',
      isSecret: false,
      isRequired: true,
    },
    LINEAR_CLIENT_SECRET: {
      description:
        'OAuth client secret from your Linear OAuth application. Stored encrypted; never exposed in API responses.',
      isSecret: true,
      isRequired: true,
    },
  },
});
