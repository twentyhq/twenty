import { useParams } from 'react-router-dom';

import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { capitalize } from 'twenty-shared';

export type ViewBarPageTitleProps = {
  viewBarId: string;
};

export const ViewBarPageTitle = ({ viewBarId }: ViewBarPageTitleProps) => {
  const { objectNamePlural } = useParams();

  const { currentViewWithCombinedFiltersAndSorts: currentView } =
    useGetCurrentView(viewBarId);

  if (!objectNamePlural) {
    return;
  }

  const pageTitle = currentView?.name
    ? `${currentView?.name} - ${capitalize(objectNamePlural)}`
    : capitalize(objectNamePlural);

  return <PageTitle title={pageTitle} />;
};
