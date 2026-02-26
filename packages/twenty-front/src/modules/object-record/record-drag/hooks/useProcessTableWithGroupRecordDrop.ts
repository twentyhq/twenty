import { type DropResult } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { originalDragSelectionComponentState } from '@/object-record/record-drag/states/originalDragSelectionComponentState';
import { processGroupDrop } from '@/object-record/record-drag/utils/processGroupDrop';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useProcessTableWithGroupRecordDrop = () => {
  const store = useStore();
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { objectNameSingular, objectMetadataItem, recordTableId } =
    useRecordTableContextOrThrow();

  const { updateOneRecord } = useUpdateOneRecord();

  const { openModal } = useModal();

  const recordIdsByGroupFamilyState = useAtomComponentFamilyStateCallbackState(
    recordIndexRecordIdsByGroupComponentFamilyState,
  );

  const currentRecordSorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
    recordTableId,
  );

  const selectedRowIds = useAtomComponentSelectorCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const isDraggingRecord = useAtomComponentStateCallbackState(
    isDraggingRecordComponentState,
    recordIndexId,
  );

  const originalDragSelection = useAtomComponentStateCallbackState(
    originalDragSelectionComponentState,
    recordIndexId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const processTableWithGroupRecordDrop = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const destinationRecordGroupId = result.destination.droppableId;
      const destinationRecordGroup = store.get(
        recordGroupDefinitionFamilyState.atomFamily(destinationRecordGroupId),
      );

      if (!isDefined(destinationRecordGroup)) {
        throw new Error('Record group is not defined');
      }

      const fieldMetadata = objectMetadataItem.fields.find(
        (field) => field.id === recordIndexGroupFieldMetadataItem?.id,
      );

      if (!isDefined(fieldMetadata)) {
        throw new Error('Field metadata is not defined');
      }

      const existingOriginalDragSelection = store.get(originalDragSelection);

      const isCurrentlyDraggingRecord = store.get(isDraggingRecord);

      const selectedRecordIds = isCurrentlyDraggingRecord
        ? existingOriginalDragSelection
        : store.get(selectedRowIds);

      const existingRecordSorts = store.get(currentRecordSorts);

      if (existingRecordSorts.length > 0) {
        openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
        return;
      }

      processGroupDrop({
        groupDropResult: result,
        store,
        selectedRecordIds,
        recordIdsByGroupFamilyState,
        onUpdateRecord: ({ recordId, position }) => {
          updateOneRecord({
            objectNameSingular,
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
      currentRecordSorts,
      store,
      objectNameSingular,
      objectMetadataItem.fields,
      originalDragSelection,
      isDraggingRecord,
      selectedRowIds,
      recordIdsByGroupFamilyState,
      recordIndexGroupFieldMetadataItem?.id,
      openModal,
      updateOneRecord,
    ],
  );

  return { processTableWithGroupRecordDrop };
};
