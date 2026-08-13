import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';

export const removeRecallBotOrThrow = async (
  externalBotId: string,
): Promise<void> => {
  if (await cancelOrEjectRecallBot(externalBotId)) {
    return;
  }

  throw new Error(`Failed to remove Recall bot ${externalBotId}`);
};
