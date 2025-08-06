import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { useRecoilCallback } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableBodyDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const { openModal } = useModal();

  const handleDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        if (currentRecordSorts.length > 0) {
          openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
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
      currentRecordSorts.length,
      recordIndexAllRecordIdsSelector,
      updateOneRow,
      openModal,
    ],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
  );
};
