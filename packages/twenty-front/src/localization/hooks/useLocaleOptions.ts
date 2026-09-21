import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { APP_LOCALES } from 'twenty-shared/translations';

export type LocaleOption = {
  label: string;
  value: (typeof APP_LOCALES)[keyof typeof APP_LOCALES];
  searchKeywords: string;
};

// Language name in English and in its own language, so it is searchable
// regardless of the UI language — e.g. typing "chinese" or "中文".
const getLocaleSearchKeywords = (
  locale: (typeof APP_LOCALES)[keyof typeof APP_LOCALES],
): string => {
  const displayNames = [locale, APP_LOCALES.en].map((displayLocale) => {
    try {
      return new Intl.DisplayNames([displayLocale], { type: 'language' }).of(
        locale,
      );
    } catch {
      return undefined;
    }
  });

  return [...new Set(displayNames.filter(isNonEmptyString))].join(' ');
};

const LOCALE_SEARCH_KEYWORDS: Record<string, string> = Object.fromEntries(
  Object.values(APP_LOCALES).map((locale) => [
    locale,
    getLocaleSearchKeywords(locale),
  ]),
);

export const useLocaleOptions = (): LocaleOption[] => {
  const { t } = useLingui();

  // Keyed by locale rather than listed, so a locale added to APP_LOCALES
  // without a label here fails the typecheck. Listed, it would ship its
  // translations and simply never appear in the picker, with no error.
  const labelByLocale: Record<keyof typeof APP_LOCALES, string> = {
    'af-ZA': t`Afrikaans`,
    'ar-SA': t`Arabic`,
    'hy-AM': t`Armenian`,
    'ca-ES': t`Catalan`,
    'zh-CN': t`Chinese — Simplified`,
    'zh-TW': t`Chinese — Traditional`,
    'cs-CZ': t`Czech`,
    'da-DK': t`Danish`,
    'nl-NL': t`Dutch`,
    en: t`English`,
    'fi-FI': t`Finnish`,
    'fr-FR': t`French`,
    'de-DE': t`German`,
    'el-GR': t`Greek`,
    'he-IL': t`Hebrew`,
    'hu-HU': t`Hungarian`,
    'it-IT': t`Italian`,
    'ja-JP': t`Japanese`,
    'ko-KR': t`Korean`,
    'no-NO': t`Norwegian`,
    'pl-PL': t`Polish`,
    'pt-PT': t`Portuguese — Portugal`,
    'pt-BR': t`Portuguese — Brazil`,
    'ro-RO': t`Romanian`,
    'ru-RU': t`Russian`,
    'sr-Cyrl': t`Serbian (Cyrillic)`,
    'sr-Latn': t`Serbian (Latin)`,
    'es-ES': t`Spanish`,
    'sv-SE': t`Swedish`,
    'tr-TR': t`Turkish`,
    'uk-UA': t`Ukrainian`,
    'uz-UZ': t`Uzbek`,
    'vi-VN': t`Vietnamese`,
    'pseudo-en': t`Pseudo-English`,
  };

  return Object.entries(labelByLocale)
    .filter(
      ([locale]) =>
        locale !== APP_LOCALES['pseudo-en'] ||
        process.env.NODE_ENV === 'development',
    )
    .map(([locale, label]) => ({
      label,
      value: locale as LocaleOption['value'],
      searchKeywords: LOCALE_SEARCH_KEYWORDS[locale] ?? '',
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
