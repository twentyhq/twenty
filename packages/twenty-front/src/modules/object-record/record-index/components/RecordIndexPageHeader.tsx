import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isObjectMetadataReadOnly } from '@/object-metadata/utils/isObjectMetadataReadOnly';
import { RecordIndexPageKanbanAddButton } from '@/object-record/record-index/components/RecordIndexPageKanbanAddButton';
import { RecordIndexPageTableAddButton } from '@/object-record/record-index/components/RecordIndexPageTableAddButton';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { PageHeaderOpenCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderOpenCommandMenuButton';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

export const RecordIndexPageHeader = () => {
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const { objectNamePlural } = useRecordIndexContextOrThrow();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const Icon = getIcon(
    findObjectMetadataItemByNamePlural(objectNamePlural)?.icon,
  );

  const recordIndexViewType = useRecoilValue(recordIndexViewTypeState);

  const shouldDisplayAddButton = objectMetadataItem
    ? !isObjectMetadataReadOnly(objectMetadataItem)
    : false;

  const isTable = recordIndexViewType === ViewType.Table;

  const pageHeaderTitle =
    objectMetadataItem?.labelPlural ?? capitalize(objectNamePlural);

  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  return (
    <PageHeader title={pageHeaderTitle} Icon={Icon}>
      {shouldDisplayAddButton &&
        (isTable ? (
          <RecordIndexPageTableAddButton />
        ) : (
          <RecordIndexPageKanbanAddButton />
        ))}
      {isPageHeaderV2Enabled && <PageHeaderOpenCommandMenuButton />}
    </PageHeader>
  );
};
