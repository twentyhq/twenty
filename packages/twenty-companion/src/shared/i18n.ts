import { i18n } from '@lingui/core';
import { messages } from '../renderer/locales/en';

if (!i18n.locale) {
  i18n.load('en', messages);
  i18n.activate('en');
}

export { i18n };
