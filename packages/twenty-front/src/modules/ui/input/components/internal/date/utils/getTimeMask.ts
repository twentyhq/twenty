import { TimeFormat } from '@/localization/constants/TimeFormat';

export const getTimeMask = (timeFormat: TimeFormat): string => {
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a time or date input mask token, not natural-language text.
  return timeFormat === TimeFormat.HOUR_12 ? 'HH`:mm` `aa' : 'HH`:mm`';
};
