import {
  DragDropContext,
  type DragStart,
  type DropResult,
} from '@hello-pangea/dnd';
import { type ReactNode } from 'react';
import { useRecoilCallback } from 'recoil';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessTableWithoutGroupRecordDrop } from '@/object-record/record-drag/hooks/useProcessTableWithoutGroupRecordDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';

export const RecordTableBodyNoRecordGroupDragDropContextProvider = ({
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
  const { processTableWithoutGroupRecordDrop } =
    useProcessTableWithoutGroupRecordDrop();

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
      processTableWithoutGroupRecordDrop(result);
      endRecordDrag();
    },
    [endRecordDrag, processTableWithoutGroupRecordDrop],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
