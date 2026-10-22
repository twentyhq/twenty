import { defineApplication } from 'twenty-sdk/define';

import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './roles/default.role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '3f6d2c1a-8b4e-4f7a-9c2d-5e1b7a9f3c48';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Help center',
  description:
    'Lets Twenty AI agents search the official Twenty documentation so they answer how-to questions from the docs instead of memory.',
  author: 'Twenty',
  category: 'Productivity',
  logoUrl: 'public/help-center-logomark.svg',
  websiteUrl: 'https://docs.twenty.com',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
