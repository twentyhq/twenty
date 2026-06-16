import { useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const ViewBarPageTitle = () => {
  const { objectNamePlural } = useParams();
  const { currentView } = useGetCurrentViewOnly();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const objectMetadataItem = findObjectMetadataItemByNamePlural(
    objectNamePlural ?? '',
  );

  const objectLabelPlural =
    objectMetadataItem?.labelPlural ?? objectNamePlural ?? '';

  const pageTitle = currentView?.name
    ? `${currentView?.name} - ${objectLabelPlural}`
    : objectLabelPlural;

  return <PageTitle title={pageTitle} />;
};
