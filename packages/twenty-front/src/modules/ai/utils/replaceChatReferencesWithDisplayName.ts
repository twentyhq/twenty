import { parseChatReferences } from '@/ai/utils/parseChatReferences';
import { replaceMalformedChatReferencesWithDisplayName } from '@/ai/utils/replaceMalformedChatReferencesWithDisplayName';

export const replaceChatReferencesWithDisplayName = (text: string): string =>
  replaceMalformedChatReferencesWithDisplayName(
    parseChatReferences(text).reduce(
      (replacedText, { fullMatch, displayName }) =>
        replacedText.replace(fullMatch, () => displayName),
      text,
    ),
  );
