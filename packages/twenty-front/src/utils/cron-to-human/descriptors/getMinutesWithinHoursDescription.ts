import { t } from '@lingui/core/macro';

import { getMinutesDescription } from '~/utils/cron-to-human/descriptors/getMinutesDescription';
import { type CronDescriptionOptions } from '~/utils/cron-to-human/types/CronDescriptionOptions';
import { formatDisplayList } from '~/utils/format/formatDisplayList';
import { formatTime as formatCronTime } from '~/utils/format/formatTime';
import { isNumericRange } from '~/utils/validation/isNumericRange';

const PLAIN_NUMBER_PATTERN = /^\d+$/;

type GetMinutesWithinHoursDescriptionParams = {
  minutes: string;
  hours: string;
  options: CronDescriptionOptions;
};

export const getMinutesWithinHoursDescription = ({
  minutes,
  hours,
  options,
}: GetMinutesWithinHoursDescriptionParams): string => {
  const hourValues = hours.split(',').map((hour) => hour.trim());

  if (
    PLAIN_NUMBER_PATTERN.test(minutes) ||
    !hourValues.every((hour) => PLAIN_NUMBER_PATTERN.test(hour))
  ) {
    return '';
  }

  const isMinuteRange = isNumericRange(minutes);
  const [startMinute, endMinute] = isMinuteRange
    ? minutes.split('-')
    : ['0', '59'];
  const use24HourFormat = options.use24HourTimeFormat ?? true;

  const hourWindows = hourValues.map((hour) => {
    const startTime = formatCronTime({
      hour,
      minute: startMinute,
      use24HourFormat,
    });
    const endTime = formatCronTime({
      hour,
      minute: endMinute,
      use24HourFormat,
    });

    return t`from ${startTime} to ${endTime}`;
  });

  const minutesDescription = isMinuteRange
    ? t`every minute`
    : getMinutesDescription(minutes, options);
  const hourWindowsList = formatDisplayList(hourWindows);

  return t`${minutesDescription} ${hourWindowsList} UTC`;
};
