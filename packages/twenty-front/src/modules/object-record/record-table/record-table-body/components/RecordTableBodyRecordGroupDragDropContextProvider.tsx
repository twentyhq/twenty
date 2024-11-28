import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ReactNode, useContext } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useComputeNewRowPosition } from '@/object-record/record-table/hooks/useComputeNewRowPosition';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from '~/utils/isDefined';

export const RecordTableBodyRecordGroupDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectNameSingular, recordTableId, objectMetadataItem } =
    useContext(RecordTableContext);

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(recordTableId);

  const viewSorts = currentViewWithCombinedFiltersAndSorts?.viewSorts || [];

  const setIsRemoveSortingModalOpenState = useSetRecoilState(
    isRemoveSortingModalOpenState,
  );

  const computeNewRowPosition = useComputeNewRowPosition();

  const handleDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        const tableAllRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        const recordGroupId = result.destination?.droppableId;

        if (!isDefined(recordGroupId)) {
          throw new Error('Record group id is not defined');
        }

        const recordGroup = getSnapshotValue(
          snapshot,
          recordGroupDefinitionFamilyState(recordGroupId),
        );

        if (!isDefined(recordGroup)) {
          throw new Error('Record group is not defined');
        }

        const fieldMetadata = objectMetadataItem.fields.find(
          (field) => field.id === recordGroup.fieldMetadataId,
        );

        if (!isDefined(fieldMetadata)) {
          throw new Error('Field metadata is not defined');
        }

        if (viewSorts.length > 0) {
          setIsRemoveSortingModalOpenState(true);
          return;
        }

        const computeResult = computeNewRowPosition(result, tableAllRecordIds);

        if (!isDefined(computeResult)) {
          return;
        }

        updateOneRow({
          idToUpdate: computeResult.draggedRecordId,
          updateOneRecordInput: {
            position: computeResult.newPosition,
            [fieldMetadata.name]: recordGroup.value,
          },
        });
      },
    [
      recordIndexAllRecordIdsSelector,
      objectMetadataItem.fields,
      viewSorts.length,
      computeNewRowPosition,
      updateOneRow,
      setIsRemoveSortingModalOpenState,
    ],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
  );
};
