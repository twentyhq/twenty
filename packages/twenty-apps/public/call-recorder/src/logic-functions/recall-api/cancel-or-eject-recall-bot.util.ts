import { RECALL_BOT_ALREADY_JOINED_STATUS } from 'src/logic-functions/constants/recall-bot-already-joined-status';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { ejectRecallBot } from 'src/logic-functions/recall-api/eject-recall-bot.util';

export const cancelOrEjectRecallBot = async (
  externalBotId: string,
): Promise<boolean> => {
  const cancelResult = await cancelRecallBot({ externalBotId });

  if (cancelResult.ok) {
    return true;
  }

  let failureMessage = cancelResult.errorMessage;

  // Deleting only works for not-yet-joined bots; eject the ones already in a call.
  if (cancelResult.status === RECALL_BOT_ALREADY_JOINED_STATUS) {
    const ejectResult = await ejectRecallBot({ externalBotId });

    if (ejectResult.ok) {
      return true;
    }

    failureMessage = ejectResult.errorMessage;
  }

  console.warn(
    `[call-recorder] failed to cancel or eject Recall bot ${externalBotId}: ${failureMessage}`,
  );

  return false;
};
