import { i18n } from '@lingui/core';

export const formatDisplayList = (items: string[]): string =>
  new Intl.ListFormat(i18n.locale, {
    style: 'long',
    type: 'conjunction',
  }).format(items);
