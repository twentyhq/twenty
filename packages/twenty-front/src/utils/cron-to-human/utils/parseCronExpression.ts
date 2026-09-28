import { type CronExpressionParts } from '~/utils/cron-to-human/types/CronExpressionParts';
import { CronExpressionParser } from 'cron-parser';
import { isDefined } from 'twenty-shared/utils';
import { normalizeWhitespace } from './normalizeWhitespace';

export const parseCronExpression = (
  expression: string,
): CronExpressionParts => {
  if (!isDefined(expression) || expression.trim() === '') {
    throw new Error('Cron expression is required');
  }

  let normalized = normalizeWhitespace(expression);

  normalized = normalized.replace(/(^|\s)\/(\d+)/g, '$1*/$2');

  const parts = normalized.split(/\s+/);

  if (parts.length < 4 || parts.length > 6) {
    throw new Error(
      `Invalid cron expression. Expected 4-6 fields, got ${parts.length}`,
    );
  }

  try {
    CronExpressionParser.parse(normalized, { tz: 'UTC' });

    // Reduced (4 fields) and standard (5 fields) formats omit the leading
    // second and minute fields, which default to 0
    const [seconds, minutes, hours, dayOfMonth, month, dayOfWeek] = [
      ...Array.from({ length: 6 - parts.length }, () => '0'),
      ...parts,
    ];

    if (
      isDefined(seconds) &&
      isDefined(minutes) &&
      isDefined(hours) &&
      isDefined(dayOfMonth) &&
      isDefined(month) &&
      isDefined(dayOfWeek)
    ) {
      return { seconds, minutes, hours, dayOfMonth, month, dayOfWeek };
    }

    throw new Error('Unexpected error in cron expression parsing');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid cron expression: ${errorMessage}`);
  }
};
