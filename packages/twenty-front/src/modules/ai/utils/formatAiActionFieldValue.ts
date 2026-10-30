import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const formatAiActionFieldValue = (value: unknown): string => {
  if (!isDefined(value) || value === '') {
    return t`Empty`;
  }

  if (isString(value)) {
    return value;
  }

  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};
