import { i18n, MessageDescriptor } from '@lingui/core';

export const getActionLabel = (label: string | MessageDescriptor): string => {
  return typeof label === 'string' ? label : i18n._(label);
};
