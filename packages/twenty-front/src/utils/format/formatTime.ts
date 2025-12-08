import { isDefined } from 'twenty-shared/utils';

type FormatTimeParams = {
  hour: string;
  minute: string;
  use24HourFormat: boolean;
  appendUTC?: boolean;
};

export const formatTime = ({
  hour,
  minute,
  use24HourFormat,
  appendUTC = false,
}: FormatTimeParams): string => {
  if (!isDefined(hour) || !isDefined(minute)) {
    return '';
  }

  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);

  if (isNaN(hourNum) || isNaN(minuteNum)) {
    return '';
  }

  let formattedTime = '';

  if (use24HourFormat) {
    formattedTime = `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`;
  } else {
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    formattedTime = `${displayHour}:${minuteNum.toString().padStart(2, '0')} ${period}`;
  }

  return appendUTC ? `${formattedTime} UTC` : formattedTime;
};
