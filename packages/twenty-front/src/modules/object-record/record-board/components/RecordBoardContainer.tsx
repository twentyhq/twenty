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
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getRecordIndexRemoveSortingModalId } from '@/object-record/record-index/utils/getRecordIndexRemoveSortingModalId';

import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });
  const { updateOneRecord: updateOneRecordHook } = useUpdateOneRecord();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const updateOneRecord = (args: {
    idToUpdate: string;
    updateOneRecordInput: Record<string, unknown>;
  }) =>
    updateOneRecordHook({
      objectNameSingular,
      ...args,
    });

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    getRecordIndexRemoveSortingModalId(recordIndexId),
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
        {isModalOpened && <RecordIndexRemoveSortingModal />}
        <RecordBoardHotkeyEffect />
        <RecordBoardBodyEscapeHotkeyEffect />
      </RecordBoardComponentInstanceContext.Provider>
    </RecordBoardContext.Provider>
  );
};
