import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordBoard } from '@/object-record/record-board/components/RecordBoard';
import { RecordBoardBodyEscapeHotkeyEffect } from '@/object-record/record-board/components/RecordBoardBodyEscapeHotkeyEffect';
import { RecordBoardHotkeyEffect } from '@/object-record/record-board/components/RecordBoardHotkeyEffect';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';

import { RecordIndexRemoveSortingModal } from '@/object-record/record-index/components/RecordIndexRemoveSortingModal';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';

import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type RecordBoardContainerProps = {
  recordBoardId: string;
  viewBarId: string;
  objectNameSingular: string;
};

export const RecordBoardContainer = ({
  recordBoardId,
  objectNameSingular,
}: RecordBoardContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });
  const { updateOneRecord } = useUpdateOneRecord({ objectNameSingular });
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const isRecordIndexRemoveSortingModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    RECORD_INDEX_REMOVE_SORTING_MODAL_ID,
  );

  if (!isDefined(recordIndexGroupFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordBoardContext.Provider
      value={{
        objectMetadataItem,
        selectFieldMetadataItem: recordIndexGroupFieldMetadataItem,
        createOneRecord,
        updateOneRecord,
        deleteOneRecord,
        recordBoardId,
        objectPermissions,
      }}
    >
      <RecordBoardComponentInstanceContext.Provider
        value={{ instanceId: recordBoardId }}
      >
        <RecordBoard />
        {isRecordIndexRemoveSortingModalOpened && (
          <RecordIndexRemoveSortingModal />
        )}
        <RecordBoardHotkeyEffect />
        <RecordBoardBodyEscapeHotkeyEffect />
      </RecordBoardComponentInstanceContext.Provider>
    </RecordBoardContext.Provider>
  );
};
