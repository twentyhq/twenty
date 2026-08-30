import { isNonEmptyString } from '@sniptt/guards';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

// The speaker's Twenty language, not navigator.language: someone working in a
// French workspace on an English-configured browser is dictating French, and
// recognising it as English produces confident nonsense rather than an error.
export const getDictationLanguage = (
  workspaceMemberLocale?: string | null,
): string => {
  if (
    !isNonEmptyString(workspaceMemberLocale) ||
    workspaceMemberLocale.startsWith('pseudo-')
  ) {
    return SOURCE_LOCALE;
  }

  return workspaceMemberLocale;
};
