import { parseCanonicalTipTapJsonDocument } from 'twenty-shared/utils';

export const isAgentChatDraftsByThreadId = (
  value: unknown,
): value is Record<string, string> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (draft) =>
      typeof draft === 'string' &&
      (draft === '' || parseCanonicalTipTapJsonDocument(draft) !== undefined),
  );
};
