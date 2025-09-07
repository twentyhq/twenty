import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isRtlLocale } from 'twenty-shared/utils';

import { dateLocaleState } from '~/localization/states/dateLocaleState';

/**
 * Hook that synchronises the document direction with the current locale.
 *
 * When the locale is RTL the document's `dir` attribute is set to `rtl`,
 * otherwise it defaults to `ltr`.
 */
export const useRtl = () => {
  const { locale } = useRecoilValue(dateLocaleState);

  useEffect(() => {
    document.documentElement.dir =
      locale && isRtlLocale(locale) ? 'rtl' : 'ltr';
  }, [locale]);
};
