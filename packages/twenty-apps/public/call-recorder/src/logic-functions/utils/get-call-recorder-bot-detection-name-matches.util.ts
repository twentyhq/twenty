import { RECALL_BOT_DETECTION_DEFAULT_NAME_MATCHES } from 'src/logic-functions/constants/recall-bot-detection-name-matches';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Builds the case-insensitive name substrings Recall treats as bots: our own bot
// name (so co-scheduled Twenty bots recognize each other) plus a default list of
// common notetakers.
export const getCallRecorderBotDetectionNameMatches = (
  botName?: string,
): string[] => {
  const candidateNames = [
    ...(isNonEmptyString(botName) ? [botName.trim()] : []),
    ...RECALL_BOT_DETECTION_DEFAULT_NAME_MATCHES,
  ];

  return dedupeCaseInsensitively(candidateNames);
};

const dedupeCaseInsensitively = (names: string[]): string[] => {
  const seenLowercaseNames = new Set<string>();

  return names.filter((name) => {
    const lowercaseName = name.toLowerCase();

    if (seenLowercaseNames.has(lowercaseName)) {
      return false;
    }

    seenLowercaseNames.add(lowercaseName);

    return true;
  });
};
