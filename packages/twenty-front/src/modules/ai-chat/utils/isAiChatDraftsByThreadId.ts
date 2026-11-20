import {
  isPlainObject,
  parseCanonicalTipTapJsonDocument,
} from 'twenty-shared/utils';

export const isAiChatDraftsByThreadId = (
  value: unknown,
): value is Record<string, string> => {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.values(value).every(
    (draft) =>
      typeof draft === 'string' &&
      (draft === '' || parseCanonicalTipTapJsonDocument(draft) !== undefined),
  );
};
