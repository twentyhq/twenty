import { type DropResult } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { processGroupDragOperation } from '@/object-record/record-drag/shared/utils/processGroupDragOperation';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useRecordTableGroupDragOperations = () => {
  const { objectNameSingular, objectMetadataItem, recordTableId } =
    useRecordTableContextOrThrow();

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const { openModal } = useModal();

  const recordIdsByGroupFamilyState = useRecoilComponentCallbackState(
    recordIndexRecordIdsByGroupComponentFamilyState,
  );

  const currentRecordSortsCallbackState = useRecoilComponentCallbackState(
    currentRecordSortsComponentState,
  );

  const selectedRowIdsSelector = useRecoilComponentCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const multiDragState = useRecordDragState('table', recordTableId);

  const processDragOperation = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        if (!result.destination) return;

        const destinationRecordGroupId = result.destination.droppableId;
        const destinationRecordGroup = getSnapshotValue(
          snapshot,
          recordGroupDefinitionFamilyState(destinationRecordGroupId),
        );

        if (!isDefined(destinationRecordGroup)) {
          throw new Error('Record group is not defined');
        }

        const fieldMetadata = objectMetadataItem.fields.find(
          (field) => field.id === destinationRecordGroup.fieldMetadataId,
        );

        if (!isDefined(fieldMetadata)) {
          throw new Error('Field metadata is not defined');
        }

        const selectedRecordIds = multiDragState.isDragging
          ? multiDragState.originalSelection
          : getSnapshotValue(snapshot, selectedRowIdsSelector);

        const currentRecordSorts = snapshot
          .getLoadable(currentRecordSortsCallbackState)
          .getValue();

        if (currentRecordSorts.length > 0) {
          openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
          return;
        }

        processGroupDragOperation({
          result,
          snapshot,
          selectedRecordIds,
          selectFieldName: fieldMetadata.name,
          recordIdsByGroupFamilyState: recordIdsByGroupFamilyState,
          onUpdateRecord: ({ recordId, position }) => {
            updateOneRow({
              idToUpdate: recordId,
              updateOneRecordInput: {
                position,
                [fieldMetadata.name]: destinationRecordGroup.value,
              },
            });
          },
        });
      },
    [
      currentRecordSortsCallbackState,
      objectMetadataItem.fields,
      recordIdsByGroupFamilyState,
      updateOneRow,
      openModal,
      selectedRowIdsSelector,
      multiDragState.originalSelection,
      multiDragState.isDragging,
    ],
  );

  return { processDragOperation };
};
