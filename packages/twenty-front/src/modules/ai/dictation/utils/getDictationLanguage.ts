import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { normalizeLocale } from 'twenty-shared/utils';

// Only the on-device engine needs this: the Web Speech API recognises exactly
// one language per session and cannot detect it, so a wrong guess produces
// confident nonsense rather than an error. The speaker's Twenty language beats
// navigator.language, which is the browser UI's rather than the speaker's.
export const getDictationLanguage = (
  workspaceMemberLocale?: string | null,
): string => {
  const locale = normalizeLocale(workspaceMemberLocale ?? null);

  // The pseudo locale is a translation-coverage tool, not a language anything
  // can be recognised in.
  return locale === APP_LOCALES['pseudo-en'] ? SOURCE_LOCALE : locale;
};
