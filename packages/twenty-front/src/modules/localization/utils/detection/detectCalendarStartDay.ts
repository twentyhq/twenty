import { FirstDayOfTheWeek } from 'twenty-shared/types';

export const detectCalendarStartDay = (): FirstDayOfTheWeek => {
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
          return FirstDayOfTheWeek.MONDAY;
        case 6:
          return FirstDayOfTheWeek.SATURDAY;
        case 7:
        default:
          return FirstDayOfTheWeek.SUNDAY;
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
    return FirstDayOfTheWeek.MONDAY;
  }

  // Middle Eastern countries often start with Saturday
  if (
    language.startsWith('ar') || // Arabic
    language.startsWith('he') || // Hebrew
    language.startsWith('fa') // Persian
  ) {
    return FirstDayOfTheWeek.SATURDAY;
  }

  // Default to Sunday (US, Canada, Japan, etc.)
  return FirstDayOfTheWeek.SUNDAY;
};
