import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { clampRecordBoardColumnWidth } from '@/object-record/record-board/utils/clampRecordBoardColumnWidth';
import { setRecordBoardColumnWidthCssVariable } from '@/object-record/record-board/utils/setRecordBoardColumnWidthCssVariable';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateViewKanbanColumnWidth } from '@/views/hooks/useUpdateViewKanbanColumnWidth';

export const useResizeBoardColumn = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const [recordIndexKanbanColumnWidth, setRecordIndexKanbanColumnWidth] =
    useAtomComponentState(recordIndexKanbanColumnWidthComponentState);

  const { updateViewKanbanColumnWidth } = useUpdateViewKanbanColumnWidth();

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);

  const isResizing = isDefined(initialPointerPositionX);

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Prevents text selection / the board horizontal drag-select from kicking in.
      event.preventDefault();
      setInitialPointerPositionX(event.clientX);
    },
    [],
  );

  const handleResizeMove = useCallback<PointerEventListener>(
    ({ x }) => {
      if (!isDefined(initialPointerPositionX)) {
        return;
      }

      setRecordBoardColumnWidthCssVariable(
        recordBoardId,
        clampRecordBoardColumnWidth(
          recordIndexKanbanColumnWidth + (x - initialPointerPositionX),
        ),
      );
    },
    [initialPointerPositionX, recordIndexKanbanColumnWidth, recordBoardId],
  );

  const handleResizeEnd = useCallback<PointerEventListener>(
    ({ x }) => {
      if (!isDefined(initialPointerPositionX)) {
        return;
      }

      setInitialPointerPositionX(null);

      const nextWidth = Math.round(
        clampRecordBoardColumnWidth(
          recordIndexKanbanColumnWidth + (x - initialPointerPositionX),
        ),
      );

      if (nextWidth !== recordIndexKanbanColumnWidth) {
        setRecordIndexKanbanColumnWidth(nextWidth);
        updateViewKanbanColumnWidth(nextWidth);
      }
    },
    [
      initialPointerPositionX,
      recordIndexKanbanColumnWidth,
      setRecordIndexKanbanColumnWidth,
      updateViewKanbanColumnWidth,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: isResizing,
    onMouseMove: handleResizeMove,
    onMouseUp: handleResizeEnd,
  });

  return { isResizing, handleResizeStart };
};
