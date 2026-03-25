import { useParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const ViewBarPageTitle = () => {
  const { objectNamePlural } = useParams();
  const { currentView } = useGetCurrentViewOnly();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural: objectNamePlural ?? '',
  });

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const pageTitle = currentView?.name
    ? `${currentView?.name} - ${objectMetadataItem.labelPlural}`
    : objectMetadataItem.labelPlural;

  return <PageTitle title={pageTitle} />;
};
