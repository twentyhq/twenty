import { i18n } from '@lingui/core';
import { isRtlLocale } from 'twenty-shared/utils';

/**
 * Returns whether the currently active i18n locale is a RTL locale.
 */
export const isRtl = (): boolean => isRtlLocale(i18n.locale);
