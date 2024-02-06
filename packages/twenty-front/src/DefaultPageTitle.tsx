import { useLocation } from 'react-router-dom';

import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const DefaultPageTitle = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return <PageTitle title={pageTitle} />;
};
