import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { isListValue } from '~/utils/validation/isListValue';
import { isNumericRange } from '~/utils/validation/isNumericRange';
import { isStepValue } from '~/utils/validation/isStepValue';
import { type CronDescriptionOptions } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

export const getMinutesDescription = (
  minutes: string,
  _options: CronDescriptionOptions,
): string => {
  if (!isDefined(minutes) || minutes.trim() === '') {
    return '';
  }

  if (minutes === '*') {
    return t`every minute`;
  }

  if (isStepValue(minutes)) {
    const [range, step] = minutes.split('/');
    const stepNum = parseInt(step, 10);
    const stepNumStr = stepNum.toString();

    if (range === '*') {
      if (stepNum === 1) {
        return t`every minute`;
      }
      return t`every ${stepNumStr} minutes`;
    }

    if (range.includes('-')) {
      const [start, end] = range.split('-');
      return t`every ${stepNumStr} minutes, between minute ${start} and ${end}`;
    }

    return t`every ${stepNumStr} minutes`;
  }

  if (isNumericRange(minutes) && minutes.includes('-')) {
    const [start, end] = minutes.split('-');
    return t`between minute ${start} and ${end}`;
  }

  if (isListValue(minutes)) {
    const values = minutes.split(',').map((v) => v.trim());
    if (values.length === 2) {
      const firstValue = values[0];
      const secondValue = values[1];
      return t`at minutes ${firstValue} and ${secondValue}`;
    }
    const lastValue = values.pop();
    const remainingValues = values.join(', ');
    return t`at minutes ${remainingValues} and ${lastValue}`;
  }

  const minuteNum = parseInt(minutes, 10);
  if (!isNaN(minuteNum)) {
    if (minuteNum === 0) {
      return t`at the top of the hour`;
    }
    if (minuteNum === 1) {
      return t`at 1 minute past the hour`;
    }
    const minuteNumStr = minuteNum.toString();
    return t`at ${minuteNumStr} minutes past the hour`;
  }

  return minutes;
};
