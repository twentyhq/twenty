import { Helmet } from '@dr.pogodin/react-helmet';
import { useLayoutEffect } from 'react';

import { SALESFARCE_CLASS_NAME } from '@/salesfarce/constants/SalesfarceClassName';
import { SALESFARCE_DOCUMENT_TITLE_SUFFIX } from '@/salesfarce/constants/SalesfarceDocumentTitleSuffix';

type SalesfarceThemeProps = {
  isActive: boolean;
};

export const SalesfarceTheme = ({ isActive }: SalesfarceThemeProps) => {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle(SALESFARCE_CLASS_NAME, isActive);
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return <Helmet titleTemplate={`%s${SALESFARCE_DOCUMENT_TITLE_SUFFIX}`} />;
};
