import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { normalizeLocale } from 'twenty-shared/utils';

// Web Speech recognises one language per session and can't detect it; navigator.language is the browser UI's.
export const getDictationLanguage = (
  workspaceMemberLocale?: string | null,
): string => {
  const locale = normalizeLocale(workspaceMemberLocale ?? null);

  // The pseudo locale is a translation-coverage tool, not a recognisable language.
  return locale === APP_LOCALES['pseudo-en'] ? SOURCE_LOCALE : locale;
};
