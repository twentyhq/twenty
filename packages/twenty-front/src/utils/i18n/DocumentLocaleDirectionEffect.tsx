import { useLingui } from '@lingui/react';
import { useEffect } from 'react';

import { applyDocumentLocaleDirection } from '~/utils/i18n/applyDocumentLocaleDirection';

export const DocumentLocaleDirectionEffect = () => {
  const { i18n } = useLingui();

  useEffect(() => {
    applyDocumentLocaleDirection(i18n.locale);
  }, [i18n.locale]);

  return null;
};
