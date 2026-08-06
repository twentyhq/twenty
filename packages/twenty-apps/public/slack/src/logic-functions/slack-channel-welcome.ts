import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { postSlackChannelWelcome } from 'src/logic-functions/utils/post-slack-channel-welcome';

export default defineLogicFunction({
  universalIdentifier: SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
  name: 'slack-channel-welcome',
  description:
    'Runs in the resolved workspace: posts a one-off introduction when the bot itself is added to a Slack channel.',
  timeoutSeconds: 15,
  handler: postSlackChannelWelcome,
});
