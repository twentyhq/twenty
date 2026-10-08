import { defineLogicFunction } from 'twenty-sdk/define';

import { CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { handlePreJoinCreditCheckJob } from 'src/logic-functions/flows/handle-pre-join-credit-check-job.util';

export default defineLogicFunction({
  universalIdentifier:
    CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'check-credits-before-recall-bot-join',
  description:
    'Cancels a scheduled Recall bot shortly before it joins when the workspace has no credits.',
  timeoutSeconds: 60,
  handler: handlePreJoinCreditCheckJob,
});
