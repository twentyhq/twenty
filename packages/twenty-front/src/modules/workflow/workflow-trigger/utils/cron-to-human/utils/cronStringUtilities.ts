import { selectOrdinal } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const formatCronTime = (
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

export const getOrdinalNumber = (num: number): string => {
  try {
    return selectOrdinal(num, {
      one: `${num}st`,
      two: `${num}nd`,
      few: `${num}rd`,
      other: `${num}th`,
    });
  } catch {
    // TODO: remove after extract?
    // Fallback for test environment - basic English ordinals
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${num}th`;
    }

    switch (lastDigit) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  }
};

export const isNumericRange = (value: string): boolean => {
  return isDefined(value) && /^\d+(-\d+)?$/.test(value);
};

export const isStepValue = (value: string): boolean => {
  return isDefined(value) && value.includes('/');
};

export const isListValue = (value: string): boolean => {
  return isDefined(value) && value.includes(',');
};
