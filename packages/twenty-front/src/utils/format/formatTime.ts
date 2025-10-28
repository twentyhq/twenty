import { isDefined } from 'twenty-shared/utils';

export const formatTime = (
  hour: string,
  minute: string,
  use24HourFormat: boolean,
): string => {
  if (!isDefined(hour) || !isDefined(minute)) {
    return '';
  }

  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);

  if (isNaN(hourNum) || isNaN(minuteNum)) {
    return '';
  }

  if (use24HourFormat) {
    return `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`;
  } else {
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minuteNum.toString().padStart(2, '0')} ${period}`;
  }
};
