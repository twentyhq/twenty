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

// Single source of truth for the locale dropdown options used across settings
// (preferred-language picker, translations bench, …). Labels are sorted and
// carry native + English search keywords.
export const useLocaleOptions = (): LocaleOption[] => {
  const { t } = useLingui();

  const unsortedLocaleOptions: Array<Omit<LocaleOption, 'searchKeywords'>> = [
    { label: t`Afrikaans`, value: APP_LOCALES['af-ZA'] },
    { label: t`Arabic`, value: APP_LOCALES['ar-SA'] },
    { label: t`Catalan`, value: APP_LOCALES['ca-ES'] },
    { label: t`Chinese — Simplified`, value: APP_LOCALES['zh-CN'] },
    { label: t`Chinese — Traditional`, value: APP_LOCALES['zh-TW'] },
    { label: t`Czech`, value: APP_LOCALES['cs-CZ'] },
    { label: t`Danish`, value: APP_LOCALES['da-DK'] },
    { label: t`Dutch`, value: APP_LOCALES['nl-NL'] },
    { label: t`English`, value: APP_LOCALES.en },
    { label: t`Finnish`, value: APP_LOCALES['fi-FI'] },
    { label: t`French`, value: APP_LOCALES['fr-FR'] },
    { label: t`German`, value: APP_LOCALES['de-DE'] },
    { label: t`Greek`, value: APP_LOCALES['el-GR'] },
    { label: t`Hebrew`, value: APP_LOCALES['he-IL'] },
    { label: t`Hungarian`, value: APP_LOCALES['hu-HU'] },
    { label: t`Italian`, value: APP_LOCALES['it-IT'] },
    { label: t`Japanese`, value: APP_LOCALES['ja-JP'] },
    { label: t`Korean`, value: APP_LOCALES['ko-KR'] },
    { label: t`Norwegian`, value: APP_LOCALES['no-NO'] },
    { label: t`Polish`, value: APP_LOCALES['pl-PL'] },
    { label: t`Portuguese — Portugal`, value: APP_LOCALES['pt-PT'] },
    { label: t`Portuguese — Brazil`, value: APP_LOCALES['pt-BR'] },
    { label: t`Romanian`, value: APP_LOCALES['ro-RO'] },
    { label: t`Russian`, value: APP_LOCALES['ru-RU'] },
    { label: t`Serbian (Cyrillic)`, value: APP_LOCALES['sr-Cyrl'] },
    { label: t`Spanish`, value: APP_LOCALES['es-ES'] },
    { label: t`Swedish`, value: APP_LOCALES['sv-SE'] },
    { label: t`Turkish`, value: APP_LOCALES['tr-TR'] },
    { label: t`Ukrainian`, value: APP_LOCALES['uk-UA'] },
    { label: t`Vietnamese`, value: APP_LOCALES['vi-VN'] },
  ];

  if (process.env.NODE_ENV === 'development') {
    unsortedLocaleOptions.push({
      label: t`Pseudo-English`,
      value: APP_LOCALES['pseudo-en'],
    });
  }

  return unsortedLocaleOptions
    .sort((optionA, optionB) => optionA.label.localeCompare(optionB.label))
    .map((option) => ({
      ...option,
      searchKeywords: getLocaleSearchKeywords(option.value),
    }));
};
