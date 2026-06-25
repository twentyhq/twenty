import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Twenty Slack',
  description:
    'Connect Slack to Twenty. Each workspace member (or a shared workspace connection) can authenticate Slack; workflow steps then post messages, ephemerals, updates, deletes, and reactions on behalf of that connection.',
  logoUrl: 'public/twenty-slack.svg',
  author: 'Twenty',
  category: 'Communication',
  websiteUrl: 'https://docs.twenty.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  serverVariables: {
    SLACK_CLIENT_ID: {
      description:
        'OAuth client ID from your Slack app (api.slack.com/apps). Public in OAuth flows; only the client secret must stay confidential.',
      isSecret: false,
      isRequired: true,
    },
    SLACK_CLIENT_SECRET: {
      description:
        'OAuth client secret from your Slack app. Stored encrypted; never exposed in API responses.',
      isSecret: true,
      isRequired: true,
    },
  },
});
