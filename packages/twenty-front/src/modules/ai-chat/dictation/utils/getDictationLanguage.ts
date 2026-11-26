import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { normalizeLocale } from 'twenty-shared/utils';

export const getDictationLanguage = (
  workspaceMemberLocale?: string | null,
): string => {
  const locale = normalizeLocale(workspaceMemberLocale ?? null);

  return locale === APP_LOCALES['pseudo-en'] ? SOURCE_LOCALE : locale;
};
