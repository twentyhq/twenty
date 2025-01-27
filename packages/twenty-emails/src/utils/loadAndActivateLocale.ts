import { i18n } from '@lingui/core';
import { messages as deMessages } from 'src/locales/de/messages';
import { messages as enMessages } from 'src/locales/en/messages';
import { messages as esMessages } from 'src/locales/es/messages';
import { messages as frMessages } from 'src/locales/fr/messages';
import { messages as itMessages } from 'src/locales/it/messages';
import { messages as ptMessages } from 'src/locales/pt/messages';
import { messages as zhHansMessages } from 'src/locales/zh-Hans/messages';
import { messages as zhHantMessages } from 'src/locales/zh-Hant/messages';

export const loadAndActivateLocale = async (locale: string) => {
  try {
    i18n.load({
      en: enMessages,
      de: deMessages,
      es: esMessages,
      fr: frMessages,
      it: itMessages,
      pt: ptMessages,
      'zh-Hans': zhHansMessages,
      'zh-Hant': zhHantMessages,
    });
    i18n.activate(locale);
  } catch (error) {
    throw new Error(`Could not load locale: ${locale}`);
  }
};
