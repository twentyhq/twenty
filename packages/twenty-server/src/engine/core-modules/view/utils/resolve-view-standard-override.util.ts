import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { type ViewDTO } from 'src/engine/core-modules/view/dtos/view.dto';

export const resolveViewStandardOverride = (
  view: Pick<ViewDTO, 'name' | 'isCustom' | 'standardOverrides'>,
  labelKey: 'name',
  locale: keyof typeof APP_LOCALES | undefined,
): string => {
  const safeLocale = locale ?? SOURCE_LOCALE;

  if (view.isCustom) {
    return view[labelKey] ?? '';
  }

  if (isDefined(view.standardOverrides?.translations)) {
    const translationValue =
      view.standardOverrides.translations[safeLocale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  if (
    safeLocale === SOURCE_LOCALE &&
    isNonEmptyString(view.standardOverrides?.[labelKey])
  ) {
    return view.standardOverrides[labelKey] ?? '';
  }

  const messageId = generateMessageId(view[labelKey] ?? '');
  const translatedMessage = i18n._(messageId);

  if (translatedMessage === messageId) {
    return view[labelKey] ?? '';
  }

  return translatedMessage;
};
