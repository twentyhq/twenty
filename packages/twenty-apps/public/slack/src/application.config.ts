import { defineApplication, FieldType } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_ACCESS_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_ACCESS_MODE } from 'src/logic-functions/constants/slack-assistant-access-mode';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Slack',
  description:
    'Your CRM, in the conversation. Mention the bot or DM it to ask about your records and create, update or soft-delete them without leaving Slack, and use the Slack steps to post messages, ephemerals, updates, deletes and reactions from your workflows.',
  logoUrl: 'public/slack.svg',
  author: 'Twenty',
  category: 'Communication',
  websiteUrl: 'https://docs.twenty.com/developers/extend/apps/getting-started',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: {
    SLACK_ASSISTANT_ACCESS: {
      universalIdentifier: SLACK_ASSISTANT_ACCESS_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Who the assistant answers in Slack. "Anyone in Slack" lets every member of the connected Slack workspace use the bot, which then acts with the Slack Assistant role alone when it cannot tell which workspace member is asking. "Linked workspace members only" makes the bot refuse anyone whose Slack account it cannot match to a Twenty workspace member, so every answer is bound to a real member\'s permissions.',
      type: FieldType.SELECT,
      options: [
        {
          label: 'Anyone in Slack',
          value: SLACK_ASSISTANT_ACCESS_MODE.EVERYONE,
        },
        {
          label: 'Linked workspace members only',
          value: SLACK_ASSISTANT_ACCESS_MODE.LINKED_MEMBERS_ONLY,
        },
      ],
      value: SLACK_ASSISTANT_ACCESS_MODE.EVERYONE,
      isSecret: false,
    },
  },
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
    SLACK_WEBHOOK_SECRET: {
      description:
        'Signing secret from your Slack app (Basic Information → App Credentials). Used to verify Slack Events API requests for the assistant. Only required if you enable the conversational assistant.',
      isSecret: true,
      isRequired: false,
    },
  },
});
