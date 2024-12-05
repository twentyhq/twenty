import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ReactNode, useContext } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useComputeNewRecordPosition } from '@/object-record/record-table/hooks/useComputeNewRecordPosition';
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

  const computeNewRowPosition = useComputeNewRecordPosition();

  const recordGroupRecordIdsState = useRecoilComponentCallbackStateV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
  );

  const handleDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        const destinationRecordGroupId = result.destination?.droppableId;

        if (!isDefined(destinationRecordGroupId)) {
          throw new Error('Record group id is not defined');
        }

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

        if (viewSorts.length > 0) {
          setIsRemoveSortingModalOpenState(true);
          return;
        }

        const desinationRecordGroupRecordIds = getSnapshotValue(
          snapshot,
          recordGroupRecordIdsState(destinationRecordGroupId),
        );

        const computeResult = computeNewRowPosition(
          result,
          desinationRecordGroupRecordIds,
        );

        if (!isDefined(computeResult)) {
          return;
        }

        updateOneRow({
          idToUpdate: result.draggableId,
          updateOneRecordInput: {
            position: computeResult.newPosition,
            [fieldMetadata.name]: destinationRecordGroup.value,
          },
        });
      },
    [
      objectMetadataItem.fields,
      viewSorts.length,
      recordGroupRecordIdsState,
      computeNewRowPosition,
      updateOneRow,
      setIsRemoveSortingModalOpenState,
    ],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
  );
};
