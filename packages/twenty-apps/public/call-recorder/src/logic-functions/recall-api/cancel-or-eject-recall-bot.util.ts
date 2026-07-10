import { isNull } from '@sniptt/guards';

import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { ejectRecallBot } from 'src/logic-functions/recall-api/eject-recall-bot.util';

export const cancelOrEjectRecallBot = async (
  externalBotId: string,
): Promise<boolean> => {
  const cancelResult = await cancelRecallBot({ externalBotId });

  if (cancelResult.ok) {
    return true;
  }

  // Deleting only works for not-yet-joined bots; eject the ones already in a call.
  if (!isNull(cancelResult.status)) {
    const ejectResult = await ejectRecallBot({ externalBotId });

    if (ejectResult.ok) {
      return true;
    }
  }

  console.warn(
    `[call-recorder] failed to cancel Recall bot ${externalBotId}: ${cancelResult.errorMessage}`,
  );

  return false;
};
