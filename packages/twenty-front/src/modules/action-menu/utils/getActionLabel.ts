import { i18n, MessageDescriptor } from '@lingui/core';
import { isString } from '@sniptt/guards';

export const getActionLabel = (label: string | MessageDescriptor): string => {
  return isString(label) ? label : i18n._(label);
};
