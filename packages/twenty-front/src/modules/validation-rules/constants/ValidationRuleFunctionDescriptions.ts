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
  dateDiff: msg`The number of whole units from the first date to the second, negative when the second is earlier. Minutes and hours are elapsed time; longer units count calendar days and months, in UTC.`,
  dateAdd: msg`The date moved by a whole number of units, in UTC. A month added to the 31st lands on the last day of the month.`,
  dateTrunc: msg`The start of the unit containing the date, in UTC. Weeks start on Monday.`,
  datePart: msg`One part of the date as a number, in UTC: YEAR, QUARTER, MONTH, WEEK, DAY, DAY_OF_WEEK (1 is Monday), HOUR or MINUTE.`,
  isInRelativeDateRange: msg`True when the date falls in a period counted from today, in UTC: PAST, NEXT or THIS, an amount, and a unit such as DAY, WEEK or MONTH. PAST and NEXT leave out the current period.`,
};
