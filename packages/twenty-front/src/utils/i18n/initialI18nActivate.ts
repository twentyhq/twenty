import { fromNavigator, fromStorage, fromUrl } from '@lingui/detect-locale';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined, isValidLocale } from 'twenty-shared/utils';

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
