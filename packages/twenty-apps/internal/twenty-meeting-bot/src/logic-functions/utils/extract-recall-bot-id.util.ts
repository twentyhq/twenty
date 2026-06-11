export type RecallBotResponse = {
  id?: unknown;
  bot_id?: unknown;
};

export const extractRecallBotId = (
  response: RecallBotResponse | undefined,
): string | null => {
  if (typeof response?.id === 'string') {
    return response.id;
  }

  if (typeof response?.bot_id === 'string') {
    return response.bot_id;
  }

  return null;
};
