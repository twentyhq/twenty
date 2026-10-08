import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { setSlackSuggestedPrompts } from 'src/logic-functions/utils/set-slack-suggested-prompts';

export default defineLogicFunction({
  universalIdentifier: SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
  name: 'slack-home-opened',
  description:
    "Runs in the resolved workspace: sets the agent's suggested prompts when a user opens the bot's Messages tab.",
  timeoutSeconds: 15,
  handler: setSlackSuggestedPrompts,
});
