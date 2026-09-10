import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Slack',
  description:
    'Your CRM, in the conversation. Mention the bot or DM it to read, create, update and soft-delete records without leaving Slack, and post messages, ephemerals, updates, deletes and reactions from your workflows.',
  logoUrl: 'public/slack.svg',
  author: 'Twenty',
  category: 'Communication',
  websiteUrl:
    'https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/public/slack',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  galleryImages: ['public/gallery/slack-cover.png'],
  serverVariables: {
    SLACK_CLIENT_ID: {
      description:
        'OAuth client ID of your Slack app (Basic Information → App Credentials). Public in OAuth flows.',
      isSecret: false,
      isRequired: true,
    },
    SLACK_CLIENT_SECRET: {
      description:
        'OAuth client secret of your Slack app. Stored encrypted and never exposed in API responses.',
      isSecret: true,
      isRequired: true,
    },
    SLACK_WEBHOOK_SECRET: {
      description:
        'Slack signing secret, used to verify every Slack Events and interactivity request. Only needed if you enable the conversational assistant.',
      isSecret: true,
      isRequired: false,
    },
  },
});
