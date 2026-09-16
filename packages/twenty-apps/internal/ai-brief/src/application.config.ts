import { defineApplication } from 'twenty-sdk/define';

import { AI_BRIEF_APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: AI_BRIEF_APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'AI Brief',
  description:
    'Living AI briefs for Companies and People: synthesizes recent timeline activity into a short brief with sentiment, refreshed nightly.',
  author: 'Crove',
  category: 'AI',
  websiteUrl: 'https://crove.io',
  emailSupport: 'support@crove.com',
  issueReportUrl: 'https://github.com/DOS/Crove-CRM/issues',
});
