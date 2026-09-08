import { getString } from '@twentyhq/recall-utils/utils/get-string.util';

export type RecallBotResponse = {
  id?: unknown;
  bot_id?: unknown;
};

export const extractRecallBotId = (
  response: RecallBotResponse | undefined,
): string | undefined => getString(response?.id) ?? getString(response?.bot_id);
