import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const ViewBarPageTitle = () => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();
  const { currentView } = useGetCurrentViewOnly();

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const pageTitle = currentView?.name
    ? `${currentView?.name} - ${objectMetadataItem.labelPlural}`
    : objectMetadataItem.labelPlural;

  return <PageTitle title={pageTitle} />;
};
