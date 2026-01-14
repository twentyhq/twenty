import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';

export const resolveTimeFormat = (timeFormat: TimeFormat): TimeFormat => {
  if (timeFormat === TimeFormat.SYSTEM) {
    const detectedFormat = detectTimeFormat();
    return TimeFormat[detectedFormat];
  }

  return timeFormat;
};
