import { RecordIndexActionMenu } from '@/action-menu/components/RecordIndexActionMenu';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { PageHeaderOpenCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderOpenCommandMenuButton';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useIcons } from 'twenty-ui';
import { capitalize } from 'twenty-shared/utils';

export const RecordIndexPageHeader = () => {
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const { objectNamePlural } = useRecordIndexContextOrThrow();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem?.icon);

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const pageHeaderTitle =
    objectMetadataItem?.labelPlural ?? capitalize(objectNamePlural);

  return (
    <PageHeader title={pageHeaderTitle} Icon={Icon}>
      <RecordIndexActionMenu indexId={recordIndexId} />
      <PageHeaderOpenCommandMenuButton />
    </PageHeader>
  );
};
