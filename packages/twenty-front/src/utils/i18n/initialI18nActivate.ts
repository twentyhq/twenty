import { fromNavigator, fromStorage, fromUrl } from '@lingui/detect-locale';
import {
  APP_LOCALES,
  isDefined,
  isValidLocale,
  SOURCE_LOCALE,
} from 'twenty-shared';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

export const initialI18nActivate = () => {
  const urlLocale = fromUrl('locale');
  const storageLocale = fromStorage('locale');
  const navigatorLocale = fromNavigator();

  let locale: keyof typeof APP_LOCALES = APP_LOCALES.en;

  if (isDefined(urlLocale) && isValidLocale(urlLocale)) {
    locale = urlLocale;
    try {
      localStorage.setItem('locale', urlLocale);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
  } else if (isDefined(storageLocale) && isValidLocale(storageLocale)) {
    locale = storageLocale;
  } else if (isDefined(navigatorLocale) && isValidLocale(navigatorLocale)) {
    // TODO: remove when we're ready to launch
    // locale = navigatorLocale;
    locale = SOURCE_LOCALE;
  }

  dynamicActivate(locale);
};
