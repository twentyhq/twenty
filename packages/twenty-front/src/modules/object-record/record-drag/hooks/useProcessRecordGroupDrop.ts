import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { type RecordDragDropResult } from '@/object-record/record-drag/types/RecordDragDropResult';
import { computeDroppedRecordPositions } from '@/object-record/record-drag/utils/computeDroppedRecordPositions';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { getRecordIndexRemoveSortingModalId } from '@/object-record/record-index/utils/getRecordIndexRemoveSortingModalId';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useProcessRecordGroupDrop = () => {
  const store = useStore();
  const { recordIndexId, objectNameSingular } = useRecordIndexContextOrThrow();
  const { updateOneRecord } = useUpdateOneRecord();
  const { openDialog } = useDialog();

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );
  const draggedRecordIdsCallbackState = useAtomComponentStateCallbackState(
    draggedRecordIdsComponentState,
  );
  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const processRecordGroupDrop = useCallback(
    ({
      draggedRecordId,
      destinationDroppableId,
      destinationIndex,
    }: RecordDragDropResult) => {
      if (store.get(currentRecordSortsCallbackState).length > 0) {
        openDialog(getRecordIndexRemoveSortingModalId(recordIndexId));
        return;
      }

      const destinationRecordGroup = store.get(
        recordGroupDefinitionFamilyState.atomFamily(destinationDroppableId),
      );

      if (
        !isDefined(destinationRecordGroup) ||
        !isDefined(recordIndexGroupFieldMetadataItem)
      ) {
        throw new Error('Record group is not defined');
      }

      const updatedRecords = computeDroppedRecordPositions({
        destinationRecordIds: store.get(
          recordIdsByGroupCallbackState(destinationDroppableId),
        ),
        destinationIndex,
        draggedRecordId,
        draggedRecordIds: store.get(draggedRecordIdsCallbackState),
        store,
      });

      const recordGroupFieldName = getFieldMetadataItemGqlFieldName(
        recordIndexGroupFieldMetadataItem,
      );

      for (const { id, position } of updatedRecords) {
        updateOneRecord({
          objectNameSingular,
          idToUpdate: id,
          updateOneRecordInput: {
            position,
            [recordGroupFieldName]: destinationRecordGroup.value,
          },
        });
      }
    },
    [
      store,
      recordIndexId,
      objectNameSingular,
      openDialog,
      updateOneRecord,
      recordIndexGroupFieldMetadataItem,
      recordIdsByGroupCallbackState,
      draggedRecordIdsCallbackState,
      currentRecordSortsCallbackState,
    ],
  );

  return { processRecordGroupDrop };
};
