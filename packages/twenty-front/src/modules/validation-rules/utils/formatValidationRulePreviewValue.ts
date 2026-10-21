import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const IGNORED_OBJECT_KEYS = ['__typename', 'id'];

export const formatValidationRulePreviewValue = (value: unknown): string => {
  if (!isDefined(value)) {
    return '';
  }

  if (Array.isArray(value)) {
    return value
      .map(formatValidationRulePreviewValue)
      .filter(isNonEmptyString)
      .join(', ');
  }

  if (!isPlainObject(value)) {
    return String(value);
  }

  if (isDefined(value.name)) {
    return formatValidationRulePreviewValue(value.name);
  }

  return Object.entries(value)
    .filter(([key]) => !IGNORED_OBJECT_KEYS.includes(key))
    .map(([, subfieldValue]) => formatValidationRulePreviewValue(subfieldValue))
    .filter(isNonEmptyString)
    .join(' ');
};
