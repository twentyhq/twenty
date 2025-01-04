import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from '~/utils/isDefined';

export const RecordTableBodyDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectNameSingular, recordTableId } = useRecordTableContextOrThrow();

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

  const handleDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        if (viewSorts.length > 0) {
          setIsRemoveSortingModalOpenState(true);
          return;
        }

        if (!isDefined(result.destination)) {
          throw new Error('Drop Destination is not defined');
        }

        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        const isSourceIndexBeforeDestinationIndex =
          result.source.index < result.destination.index;

        const recordBeforeDestinationId =
          allRecordIds[
            isSourceIndexBeforeDestinationIndex
              ? result.destination.index
              : result.destination.index - 1
          ];

        const recordBeforeDestination = recordBeforeDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordBeforeDestinationId))
              .getValue()
          : null;

        const recordAfterDestinationId =
          allRecordIds[
            isSourceIndexBeforeDestinationIndex
              ? result.destination.index + 1
              : result.destination.index
          ];

        const recordAfterDestination = recordAfterDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterDestinationId))
              .getValue()
          : null;

        const newPosition = getDraggedRecordPosition(
          recordBeforeDestination?.position,
          recordAfterDestination?.position,
        );

        if (!isDefined(newPosition)) {
          return;
        }

        updateOneRow({
          idToUpdate: result.draggableId,
          updateOneRecordInput: {
            position: newPosition,
          },
        });
      },
    [
      recordIndexAllRecordIdsSelector,
      setIsRemoveSortingModalOpenState,
      updateOneRow,
      viewSorts.length,
    ],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
  );
};
