import { useLingui } from '@lingui/react';
import { useLocation } from 'react-router-dom';

import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const WorkspaceAppPageTitle = () => {
  const { pathname } = useLocation();
  // getPageTitleFromPath reads the global i18n, so subscribe to re-render on locale change
  useLingui();

  return <PageTitle title={getPageTitleFromPath(pathname)} />;
};
