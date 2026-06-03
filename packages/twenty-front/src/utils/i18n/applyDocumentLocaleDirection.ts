import { REACT_APP_SHAHRYAR_MODE } from '~/config';
import { getLocaleDirection } from '~/utils/i18n/getLocaleDirection';

const SHAHRYAR_LOCALE = 'ckb';

export const applyDocumentLocaleDirection = (locale: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  const documentLocale = REACT_APP_SHAHRYAR_MODE ? SHAHRYAR_LOCALE : locale;

  document.documentElement.lang = documentLocale;
  document.documentElement.dir = getLocaleDirection(documentLocale);
};
