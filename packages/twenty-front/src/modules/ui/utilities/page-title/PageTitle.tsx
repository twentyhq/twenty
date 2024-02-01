import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { getPageTitleFromPath } from '~/utils/title-utils';

export const PageTitle = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return (
    <Helmet>
      <title>{pageTitle}</title>
    </Helmet>
  );
};
