import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { ViewType } from '@/views/types/ViewType';
import { capitalize } from '~/utils/string/capitalize';

type RecordIndexPageHeaderProps = {
  createRecord: () => void;
};

export const RecordIndexPageHeader = ({
  createRecord,
}: RecordIndexPageHeaderProps) => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const Icon = getIcon(
    findObjectMetadataItemByNamePlural(objectNamePlural)?.icon,
  );

  const recordIndexViewType = useRecoilValue(recordIndexViewTypeState);

  const canAddRecord =
    recordIndexViewType === ViewType.Table && !objectMetadataItem?.isRemote;

  return (
    <PageHeader title={capitalize(objectNamePlural)} Icon={Icon}>
      <PageHotkeysEffect onAddButtonClick={createRecord} />
      {canAddRecord && <PageAddButton onClick={createRecord} />}
    </PageHeader>
  );
};
