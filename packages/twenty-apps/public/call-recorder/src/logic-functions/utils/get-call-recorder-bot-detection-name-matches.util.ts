import { isUndefined } from '@sniptt/guards';

import { CALL_RECORDER_BOT_DETECTION_ADDITIONAL_NAMES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-bot-detection-additional-names-env-var-name';
import { RECALL_BOT_DETECTION_DEFAULT_NAME_MATCHES } from 'src/logic-functions/constants/recall-bot-detection-name-matches';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Builds the case-insensitive name substrings Recall treats as bots: our own bot
// name (so co-scheduled Twenty bots recognize each other), a default notetaker
// list, and any comma-separated names configured on the instance.
export const getCallRecorderBotDetectionNameMatches = (
  botName?: string,
): string[] => {
  const additionalNames = parseAdditionalNames(
    getApplicationVariableValue(
      CALL_RECORDER_BOT_DETECTION_ADDITIONAL_NAMES_ENV_VAR_NAME,
    ),
  );

  const candidateNames = [
    ...(isNonEmptyString(botName) ? [botName.trim()] : []),
    ...RECALL_BOT_DETECTION_DEFAULT_NAME_MATCHES,
    ...additionalNames,
  ];

  return dedupeCaseInsensitively(candidateNames);
};

const parseAdditionalNames = (rawValue: string | undefined): string[] => {
  if (isUndefined(rawValue)) {
    return [];
  }

  return rawValue
    .split(',')
    .map((name) => name.trim())
    .filter(isNonEmptyString);
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
