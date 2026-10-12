import { useLocation } from 'react-router-dom';

import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const WorkspaceAppPageTitle = () => {
  const { pathname } = useLocation();

  return <PageTitle title={getPageTitleFromPath(pathname)} />;
};
