import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordIndexRemoveSortingModal } from '@/object-record/record-index/components/RecordIndexRemoveSortingModal';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getRecordIndexRemoveSortingModalId } from '@/object-record/record-index/utils/getRecordIndexRemoveSortingModalId';
import { RecordList } from '@/object-record/record-list/components/RecordList';
import { RecordListSSESubscribeEffect } from '@/object-record/record-list/components/RecordListSSESubscribeEffect';
import { RecordListContextProvider } from '@/object-record/record-list/contexts/RecordListContext';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordListContainerProps = {
  objectNameSingular: string;
  viewBarInstanceId: string;
};

export const RecordListContainer = ({
  objectNameSingular,
  viewBarInstanceId,
}: RecordListContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const isDialogOpened = useAtomComponentStateValue(
    isDialogOpenedComponentState,
    getRecordIndexRemoveSortingModalId(recordIndexId),
  );

  return (
    <RecordListContextProvider
      value={{
        viewBarInstanceId,
        objectNameSingular,
        objectMetadataItem,
        objectPermissions,
      }}
    >
      <RecordList />
      <RecordListSSESubscribeEffect />
      {isDialogOpened && <RecordIndexRemoveSortingModal />}
    </RecordListContextProvider>
  );
};
