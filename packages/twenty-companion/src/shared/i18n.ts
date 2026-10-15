import { i18n } from '@lingui/core';

if (!i18n.locale) {
  i18n.load('en', {});
  i18n.activate('en');
}

export { i18n };
