import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { RecordIndexPageKanbanAddButton } from '@/object-record/record-index/components/RecordIndexPageKanbanAddButton';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { ViewType } from '@/views/types/ViewType';
import { capitalize } from '~/utils/string/capitalize';

type RecordIndexPageHeaderProps = {
  createRecord: () => void;
  recordIndexId: string;
  objectNamePlural: string;
};

export const RecordIndexPageHeader = ({
  createRecord,
  recordIndexId,
  objectNamePlural,
}: RecordIndexPageHeaderProps) => {
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const Icon = getIcon(
    findObjectMetadataItemByNamePlural(objectNamePlural)?.icon,
  );

  const recordIndexViewType = useRecoilValue(recordIndexViewTypeState);

  const isTable =
    recordIndexViewType === ViewType.Table && !objectMetadataItem?.isRemote;

  const pageHeaderTitle =
    objectMetadataItem?.labelPlural ?? capitalize(objectNamePlural);

  return (
    <PageHeader title={pageHeaderTitle} Icon={Icon}>
      <PageHotkeysEffect onAddButtonClick={createRecord} />
      {isTable ? (
        <PageAddButton onClick={createRecord} />
      ) : (
        <RecordIndexPageKanbanAddButton
          recordIndexId={recordIndexId}
          objectNamePlural={objectNamePlural}
        />
      )}
    </PageHeader>
  );
};
