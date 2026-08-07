import { i18n, type MessageDescriptor } from '@lingui/core';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getCommandMenuItemLabel = (
  label: Nullable<string | MessageDescriptor>,
): string => {
  if (!isDefined(label)) {
    return '';
  }

  if (typeof label === 'string') {
    return i18n._(label);
  }

  return i18n._(label);
};
