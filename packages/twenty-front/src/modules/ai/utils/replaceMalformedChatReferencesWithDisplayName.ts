import { CHAT_REFERENCE_MALFORMED_REGEX } from '@/ai/constants/ChatReferenceMalformedRegex';

export const replaceMalformedChatReferencesWithDisplayName = (
  text: string,
): string => {
  if (!text.includes('[[')) {
    return text;
  }

  return text.replace(
    CHAT_REFERENCE_MALFORMED_REGEX,
    (fullMatch: string, payload: string) => {
      const lastSeparatorIndex = payload.lastIndexOf(':');

      return lastSeparatorIndex === -1
        ? fullMatch
        : payload.slice(lastSeparatorIndex + 1);
    },
  );
};
