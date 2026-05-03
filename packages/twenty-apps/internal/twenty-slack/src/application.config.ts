import { defineApplication } from 'twenty-sdk/define';

import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './roles/default-function.role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  'a8c47f21-3b9e-4d2a-8f61-9c0e7d4a2b51';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Twenty Slack',
  description:
    'Send and manage Slack messages from Twenty workflows: post, ephemeral, update, delete, and reactions. Uses a dedicated Slack bot token per app registration.',
  icon: 'IconBrandSlack',
  logoUrl: 'public/twenty-slack.svg',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  serverVariables: {
    SLACK_BOT_TOKEN: {
      description:
        'Slack bot user OAuth token (xoxb-...). Create a separate Slack app for this Twenty app; do not reuse tokens across different Twenty apps.',
      isSecret: true,
      isRequired: true,
    },
  },
});
