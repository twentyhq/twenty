import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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

  if (typeof value !== 'object') {
    return String(value);
  }

  const objectValue = value as Record<string, unknown>;

  if (isDefined(objectValue.name)) {
    return formatValidationRulePreviewValue(objectValue.name);
  }

  return Object.entries(objectValue)
    .filter(([key]) => !IGNORED_OBJECT_KEYS.includes(key))
    .map(([, subfieldValue]) => formatValidationRulePreviewValue(subfieldValue))
    .filter(isNonEmptyString)
    .join(' ');
};
