import { i18n, type MessageDescriptor } from '@lingui/core';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getCommandMenuItemLabel = (
  label: Nullable<string | MessageDescriptor>,
): string => {
  if (!isDefined(label)) {
    return '';
  }

  // i18n._ overloads on descriptor vs id, so the union has to be narrowed
  // before the call rather than passed through
  return typeof label === 'string' ? i18n._(label) : i18n._(label);
};
