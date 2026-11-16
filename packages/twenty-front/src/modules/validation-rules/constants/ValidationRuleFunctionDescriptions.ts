import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ValidationRuleFunctionName } from 'twenty-shared/types';

export const VALIDATION_RULE_FUNCTION_DESCRIPTIONS: Record<
  ValidationRuleFunctionName,
  MessageDescriptor
> = {
  isDefined: msg`True when the value is set, even to an empty text.`,
  isEmpty: msg`True when the value is not set, an empty text, an empty list, or a composite field with every part empty.`,
  isNonEmptyString: msg`True when the value is a text with at least one character.`,
  includes: msg`True when a multi-select or array field contains the value, or when a text contains the given text. Letter case matters.`,
  arrayLength: msg`The number of items in the list, or 0 when it is not a list.`,
  daysSince: msg`The number of days from the date to today, in UTC. Negative for a date in the future.`,
  isInRelativeDateRange: msg`True when the date falls in a period counted from today, in UTC: PAST, NEXT or THIS, an amount, and a unit such as DAY, WEEK or MONTH. PAST and NEXT leave out the current period.`,
};
