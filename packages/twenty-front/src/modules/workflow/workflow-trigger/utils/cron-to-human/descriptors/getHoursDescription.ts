import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { formatTime as formatCronTime } from '~/utils/format/formatTime';
import { isListValue } from '~/utils/validation/isListValue';
import { isNumericRange } from '~/utils/validation/isNumericRange';
import { isStepValue } from '~/utils/validation/isStepValue';
import { type CronDescriptionOptions } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

export const getHoursDescription = (
  hours: string,
  minutes: string,
  options: CronDescriptionOptions,
): string => {
  if (!isDefined(hours) || hours.trim() === '') {
    return '';
  }

  const use24Hour = options.use24HourTimeFormat ?? true;

  if (hours === '*') {
    return t`every hour`;
  }

  if (isStepValue(hours)) {
    const [range, step] = hours.split('/');
    const stepNum = parseInt(step, 10);

    if (range === '*') {
      if (stepNum === 1) {
        return t`every hour`;
      }
      const stepNumStr = stepNum.toString();
      return t`every ${stepNumStr} hours`;
    }

    if (range.includes('-')) {
      const [start, end] = range.split('-');
      const stepNumStr = stepNum.toString();
      const startTime = formatCronTime({
        hour: start,
        minute: '0',
        use24HourFormat: use24Hour,
        appendUTC: true,
      });
      const endTime = formatCronTime({
        hour: end,
        minute: '0',
        use24HourFormat: use24Hour,
        appendUTC: true,
      });
      return t`every ${stepNumStr} hours, between ${startTime} and ${endTime}`;
    }

    const stepNumStr = stepNum.toString();
    return t`every ${stepNumStr} hours`;
  }

  if (isNumericRange(hours) && hours.includes('-')) {
    const [start, end] = hours.split('-');
    const startTime = formatCronTime({
      hour: start,
      minute: '0',
      use24HourFormat: use24Hour,
      appendUTC: true,
    });
    const endTime = formatCronTime({
      hour: end,
      minute: '0',
      use24HourFormat: use24Hour,
      appendUTC: true,
    });
    return t`between ${startTime} and ${endTime}`;
  }

  if (isListValue(hours)) {
    const values = hours.split(',').map((v) => v.trim());
    const formattedTimes = values.map((hour) =>
      formatCronTime({
        hour,
        minute: minutes || '0',
        use24HourFormat: use24Hour,
        appendUTC: true,
      }),
    );

    if (formattedTimes.length === 2) {
      const firstTime = formattedTimes[0];
      const secondTime = formattedTimes[1];
      return t`at ${firstTime} and ${secondTime}`;
    }
    const lastTime = formattedTimes.pop();
    const remainingTimes = formattedTimes.join(', ');
    return t`at ${remainingTimes} and ${lastTime}`;
  }

  const hourNum = parseInt(hours, 10);
  if (!isNaN(hourNum)) {
    const formattedTime = formatCronTime({
      hour: hours,
      minute: minutes || '0',
      use24HourFormat: use24Hour,
      appendUTC: true,
    });
    return t`at ${formattedTime}`;
  }

  return hours;
};
