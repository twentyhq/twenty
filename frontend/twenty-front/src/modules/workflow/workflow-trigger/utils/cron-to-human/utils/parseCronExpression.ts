import { type CronExpressionParts } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronExpressionParts';
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

    // Handle different cron formats that cron-parser accepts
    if (parts.length === 4) {
      // Reduced format: hour day month dayOfWeek (minute defaults to 0)
      return {
        seconds: '0',
        minutes: '0',
        hours: parts[0],
        dayOfMonth: parts[1],
        month: parts[2],
        dayOfWeek: parts[3],
      };
    } else if (parts.length === 5) {
      // Standard format: minute hour day month dayOfWeek
      return {
        seconds: '0',
        minutes: parts[0],
        hours: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      };
    } else if (parts.length === 6) {
      // Extended format: second minute hour day month dayOfWeek
      return {
        seconds: parts[0],
        minutes: parts[1],
        hours: parts[2],
        dayOfMonth: parts[3],
        month: parts[4],
        dayOfWeek: parts[5],
      };
    }

    throw new Error('Unexpected error in cron expression parsing');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid cron expression: ${errorMessage}`);
  }
};
