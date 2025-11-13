import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessTableWithGroupRecordDrop } from '@/object-record/record-drag/hooks/useProcessTableWithGroupRecordDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import {
  DragDropContext,
  type DragStart,
  type DropResult,
} from '@hello-pangea/dnd';
import { type ReactNode } from 'react';
import { useRecoilCallback } from 'recoil';

export const RecordTableBodyRecordGroupDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const selectedRowIdsSelector = useRecoilComponentCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const { startRecordDrag } = useStartRecordDrag();
  const { endRecordDrag } = useEndRecordDrag();

  const { processTableWithGroupRecordDrop } =
    useProcessTableWithGroupRecordDrop();

  const handleDragStart = useRecoilCallback(
    ({ snapshot }) =>
      (start: DragStart) => {
        const currentSelectedRecordIds = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

        startRecordDrag(start, currentSelectedRecordIds);
      },
    [selectedRowIdsSelector, startRecordDrag],
  );

  const handleDragEnd = useRecoilCallback(
    () => (result: DropResult) => {
      processTableWithGroupRecordDrop(result);

      endRecordDrag();
    },
    [endRecordDrag, processTableWithGroupRecordDrop],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
