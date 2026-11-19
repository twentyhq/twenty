import { fromNavigator, fromStorage, fromUrl } from '@lingui/detect-locale';
import { APP_LOCALES } from 'twenty-shared/translations';
import { isDefined, isValidLocale, normalizeLocale } from 'twenty-shared/utils';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import {
  LOCALE_LOCAL_STORAGE_KEY,
  persistLocale,
} from '~/utils/i18n/persistLocale';

export const initialI18nActivate = () => {
  const urlLocale = fromUrl('locale');
  const storageLocale = fromStorage(LOCALE_LOCAL_STORAGE_KEY);
  const navigatorLocale = fromNavigator();

  let locale: keyof typeof APP_LOCALES = APP_LOCALES.en;

  const normalizedUrlLocale = isDefined(urlLocale)
    ? normalizeLocale(urlLocale)
    : null;
  const normalizedStorageLocale = isDefined(storageLocale)
    ? normalizeLocale(storageLocale)
    : null;
  const normalizedNavigatorLocale = isDefined(navigatorLocale)
    ? normalizeLocale(navigatorLocale)
    : null;

  if (isDefined(normalizedUrlLocale) && isValidLocale(normalizedUrlLocale)) {
    locale = normalizedUrlLocale;
    persistLocale(normalizedUrlLocale);
  } else if (
    isDefined(normalizedStorageLocale) &&
    isValidLocale(normalizedStorageLocale)
  ) {
    locale = normalizedStorageLocale;
  } else if (
    isDefined(normalizedNavigatorLocale) &&
    isValidLocale(normalizedNavigatorLocale)
  ) {
    locale = normalizedNavigatorLocale;
  }

  dynamicActivate(locale);
};
