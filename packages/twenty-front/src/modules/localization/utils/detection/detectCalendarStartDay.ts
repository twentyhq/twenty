import { type CalendarStartDay } from 'twenty-shared';
import { type ExcludeLiteral } from '~/types/ExcludeLiteral';

const MONDAY_KEY: keyof typeof CalendarStartDay = 'MONDAY';
const SATURDAY_KEY: keyof typeof CalendarStartDay = 'SATURDAY';
const SUNDAY_KEY: keyof typeof CalendarStartDay = 'SUNDAY';

export type NonSystemCalendarStartDay = ExcludeLiteral<
  keyof typeof CalendarStartDay,
  'SYSTEM'
>;

export const detectCalendarStartDay = (): NonSystemCalendarStartDay => {
  // Use Intl.Locale to get the first day of the week from the user's locale
  // This requires a modern browser that supports Intl.Locale
  try {
    const locale = new Intl.Locale(navigator?.language || 'en-US');

    // Check if the weekInfo property is available (newer browsers)
    if (
      'weekInfo' in locale &&
      locale.weekInfo !== null &&
      locale.weekInfo !== undefined &&
      typeof locale.weekInfo === 'object' &&
      'firstDay' in locale.weekInfo
    ) {
      const firstDay = locale.weekInfo.firstDay;

      // Map Intl.Locale firstDay values to our enum keys
      // Intl.Locale uses 1=Monday, 7=Sunday, 6=Saturday
      switch (firstDay) {
        case 1:
          return MONDAY_KEY;
        case 6:
          return SATURDAY_KEY;
        case 7:
        default:
          return SUNDAY_KEY;
      }
    }
  } catch {
    // Fallback if Intl.Locale is not supported or fails
  }

  // Fallback: Use a heuristic based on common locale patterns
  const language = (navigator?.language || 'en-US').toLowerCase();

  // Most European countries, Australia, New Zealand start with Monday
  if (
    language.startsWith('de') || // German
    language.startsWith('fr') || // French
    language.startsWith('es') || // Spanish
    language.startsWith('it') || // Italian
    language.startsWith('pt') || // Portuguese
    language.startsWith('nl') || // Dutch
    language.startsWith('sv') || // Swedish
    language.startsWith('no') || // Norwegian
    language.startsWith('da') || // Danish
    language.startsWith('fi') || // Finnish
    language.startsWith('pl') || // Polish
    language.startsWith('ru') || // Russian
    language.startsWith('en-gb') || // British English
    language.startsWith('en-au') || // Australian English
    language.startsWith('en-nz') // New Zealand English
  ) {
    return MONDAY_KEY;
  }

  // Middle Eastern countries often start with Saturday
  if (
    language.startsWith('ar') || // Arabic
    language.startsWith('he') || // Hebrew
    language.startsWith('fa') // Persian
  ) {
    return SATURDAY_KEY;
  }

  // Default to Sunday (US, Canada, Japan, etc.)
  return SUNDAY_KEY;
};
