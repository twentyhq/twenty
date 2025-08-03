import { useParams } from 'react-router-dom';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRecoilValue } from 'recoil';

export const ViewBarPageTitle = () => {
  const { objectNamePlural } = useParams();
  const { currentView } = useGetCurrentViewOnly();

  const objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: objectNamePlural ?? '',
      objectNameType: 'plural',
    }),
  );

  if (!objectNamePlural || !objectMetadataItem) {
    return null;
  }

  const pageTitle = currentView?.name
    ? `${currentView?.name} - ${objectMetadataItem.labelPlural}`
    : objectMetadataItem.labelPlural;

  return <PageTitle title={pageTitle} />;
};
