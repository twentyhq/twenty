import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';

export const getEmailRecipientSuggestionList = ({
  rankedSuggestions,
  typedEmailSuggestion,
  excludedRecipientKeys,
  limit,
}: {
  rankedSuggestions: EmailRecipientSuggestion[];
  typedEmailSuggestion?: EmailRecipientSuggestion;
  excludedRecipientKeys: string[];
  limit: number;
}): EmailRecipientSuggestion[] => {
  const typedEmailKey = isDefined(typedEmailSuggestion)
    ? getEmailRecipientKey(typedEmailSuggestion.recipient.address)
    : null;

  const candidates = isDefined(typedEmailSuggestion)
    ? [
        ...rankedSuggestions.filter(
          (suggestion) =>
            getEmailRecipientKey(suggestion.recipient.address) ===
            typedEmailKey,
        ),
        typedEmailSuggestion,
        ...rankedSuggestions.filter(
          (suggestion) =>
            getEmailRecipientKey(suggestion.recipient.address) !==
            typedEmailKey,
        ),
      ]
    : rankedSuggestions;

  const excludedKeys = new Set(excludedRecipientKeys);
  const pickedKeys = new Set<string>();
  const suggestionList: EmailRecipientSuggestion[] = [];

  for (const suggestion of candidates) {
    if (suggestionList.length === limit) {
      break;
    }

    const suggestionKey = getEmailRecipientKey(suggestion.recipient.address);

    if (
      !isNonEmptyString(suggestionKey) ||
      excludedKeys.has(suggestionKey) ||
      pickedKeys.has(suggestionKey)
    ) {
      continue;
    }

    pickedKeys.add(suggestionKey);
    suggestionList.push(suggestion);
  }

  return suggestionList;
};
