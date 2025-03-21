import { useParams } from 'react-router-dom';

import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { capitalize } from 'twenty-shared/utils';

export const ViewBarPageTitle = () => {
  const { objectNamePlural } = useParams();

  const { currentView } = useGetCurrentViewOnly();

  if (!objectNamePlural) {
    return;
  }

  const pageTitle = currentView?.name
    ? `${currentView?.name} - ${capitalize(objectNamePlural)}`
    : capitalize(objectNamePlural);

  return <PageTitle title={pageTitle} />;
};
