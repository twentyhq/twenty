import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ReactNode, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useComputeNewRowPosition } from '@/object-record/record-table/hooks/useComputeNewRowPosition';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { isDefined } from '~/utils/isDefined';

export const RecordTableBodyDragDropContext = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectNameSingular, recordTableId } = useContext(RecordTableContext);

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const tableRowIds = useRecoilComponentValueV2(tableRowIdsComponentState);

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(recordTableId);

  const viewSorts = currentViewWithCombinedFiltersAndSorts?.viewSorts || [];

  const setIsRemoveSortingModalOpenState = useSetRecoilState(
    isRemoveSortingModalOpenState,
  );

  const computeNewRowPosition = useComputeNewRowPosition();

  const handleDragEnd = (result: DropResult) => {
    if (viewSorts.length > 0) {
      setIsRemoveSortingModalOpenState(true);
      return;
    }

    const computeResult = computeNewRowPosition(result, tableRowIds);

    if (!isDefined(computeResult)) {
      return;
    }

    updateOneRow({
      idToUpdate: computeResult.draggedRecordId,
      updateOneRecordInput: {
        position: computeResult.newPosition,
      },
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
  );
};
