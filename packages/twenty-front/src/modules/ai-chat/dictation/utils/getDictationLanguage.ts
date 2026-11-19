import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { normalizeLocale } from 'twenty-shared/utils';

// Web Speech can't detect the language and a wrong one yields confident nonsense, not an error, so the
// member's locale wins over navigator.language, which is the browser UI's.
export const getDictationLanguage = (
  workspaceMemberLocale?: string | null,
): string => {
  const locale = normalizeLocale(workspaceMemberLocale ?? null);

  // The pseudo locale is a translation-coverage tool, not a recognisable language.
  return locale === APP_LOCALES['pseudo-en'] ? SOURCE_LOCALE : locale;
};
