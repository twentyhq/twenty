import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useCallback } from 'react';

type TimeValue = {
  hour: number;
  minute: number;
};

type UseTimeInputReturn = {
  formatTime: (hour: number, minute: number) => string;
  parseTime: (timeString: string) => TimeValue | null;
  isHour12: boolean;
};

export const useTimeInput = (timeFormat: TimeFormat): UseTimeInputReturn => {
  const isHour12 = timeFormat === TimeFormat.HOUR_12;

  const formatTime = useCallback(
    (hour: number, minute: number): string => {
      const hh = isHour12
        ? (hour % 12 || 12).toString().padStart(2, '0')
        : hour.toString().padStart(2, '0');
      const mm = minute.toString().padStart(2, '0');

      if (isHour12) {
        const amPm = hour >= 12 ? 'PM' : 'AM';
        return `${hh}:${mm} ${amPm}`;
      }
      return `${hh}:${mm}`;
    },
    [isHour12],
  );

  const parseTime = (timeString: string): TimeValue | null => {
    if (isHour12) {
      const match = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return null;

      const [, hoursStr, minutesStr, amPmStr] = match;
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      const isValidHour = hours >= 1 && hours <= 12;
      const isValidMinute = minutes >= 0 && minutes <= 59;
      if (isNaN(hours) || isNaN(minutes) || !isValidHour || !isValidMinute) {
        return null;
      }

      const isPM = amPmStr.toUpperCase() === 'PM';
      const hour24 = (hours % 12) + (isPM ? 12 : 0);
      return { hour: hour24, minute: minutes };
    } else {
      const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;

      const [, hoursStr, minutesStr] = match;
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      const isValidHour = hours >= 0 && hours <= 23;
      const isValidMinute = minutes >= 0 && minutes <= 59;
      if (isNaN(hours) || isNaN(minutes) || !isValidHour || !isValidMinute) {
        return null;
      }

      return { hour: hours, minute: minutes };
    }
  };

  return {
    formatTime,
    parseTime,
    isHour12,
  };
};
