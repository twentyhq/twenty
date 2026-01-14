import { DateFormat } from '@/localization/constants/DateFormat';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';

export const resolveDateFormat = (dateFormat: DateFormat): DateFormat => {
  if (dateFormat === DateFormat.SYSTEM) {
    const detectedFormat = detectDateFormat();
    return DateFormat[detectedFormat];
  }

  return dateFormat;
};
