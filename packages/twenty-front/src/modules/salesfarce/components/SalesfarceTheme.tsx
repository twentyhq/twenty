import { Helmet } from '@dr.pogodin/react-helmet';

import { SalesfarceThemeEffect } from '@/salesfarce/components/SalesfarceThemeEffect';
import { SALESFARCE_DOCUMENT_TITLE_SUFFIX } from '@/salesfarce/constants/SalesfarceDocumentTitleSuffix';

type SalesfarceThemeProps = {
  isActive: boolean;
};

export const SalesfarceTheme = ({ isActive }: SalesfarceThemeProps) => (
  <>
    <SalesfarceThemeEffect isActive={isActive} />
    {isActive && (
      <Helmet titleTemplate={`%s${SALESFARCE_DOCUMENT_TITLE_SUFFIX}`} />
    )}
  </>
);
