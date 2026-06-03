import { useLingui } from '@lingui/react';

import { getLocaleDirection } from '~/utils/i18n/getLocaleDirection';

export const useIsRtl = () => {
  const { i18n } = useLingui();

  return getLocaleDirection(i18n.locale) === 'rtl';
};
