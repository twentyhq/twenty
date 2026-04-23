import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

// TODO simplify
export const resolveFieldMetadataStandardOverride = (
  fieldMetadata: Pick<
    FieldMetadataDTO,
    'label' | 'description' | 'icon' | 'isCustom' | 'standardOverrides'
  >,
  labelKey: 'label' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
): string => {
  if (fieldMetadata.isCustom) {
    return fieldMetadata[labelKey] ?? '';
  }

  if (labelKey === 'icon' && isDefined(fieldMetadata.standardOverrides?.icon)) {
    return fieldMetadata.standardOverrides.icon;
  }

  if (
    isDefined(fieldMetadata.standardOverrides?.translations) &&
    isDefined(locale) &&
    labelKey !== 'icon'
  ) {
    const translationValue =
      fieldMetadata.standardOverrides.translations[locale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  if (
    locale === SOURCE_LOCALE &&
    isNonEmptyString(fieldMetadata.standardOverrides?.[labelKey])
  ) {
    return fieldMetadata.standardOverrides[labelKey] ?? '';
  }

  const messageId = generateMessageId(fieldMetadata[labelKey] ?? '');

  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return fieldMetadata[labelKey] ?? '';
  }

  return translatedMessage;
};
