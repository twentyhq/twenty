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
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateViewKanbanColumnWidth } from '@/views/hooks/useUpdateViewKanbanColumnWidth';

export const useResizeBoardColumn = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const [recordIndexKanbanColumnWidth, setRecordIndexKanbanColumnWidth] =
    useAtomComponentState(recordIndexKanbanColumnWidthComponentState);

  const { updateViewKanbanColumnWidth } = useUpdateViewKanbanColumnWidth();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);

  const isResizing = isDefined(initialPointerPositionX);

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      setDragSelectionStartEnabled(false);
      setInitialPointerPositionX(event.clientX);
    },
    [setDragSelectionStartEnabled],
  );

  const handleResizeMove = useCallback<PointerEventListener>(
    ({ x, event }) => {
      if (!isDefined(initialPointerPositionX)) {
        return;
      }

      // useTrackPointer ends the drag on a document mouseup, which never fires
      // when the button is released outside the window. A move with no button
      // pressed means that happened, so cancel the drag (reset + restore the
      // committed width) instead of leaving it stuck.
      if ('buttons' in event && event.buttons === 0) {
        setInitialPointerPositionX(null);
        setDragSelectionStartEnabled(true);
        setRecordBoardColumnWidthCssVariable(
          recordBoardId,
          recordIndexKanbanColumnWidth,
        );
        return;
      }

      setRecordBoardColumnWidthCssVariable(
        recordBoardId,
        clampRecordBoardColumnWidth(
          recordIndexKanbanColumnWidth + (x - initialPointerPositionX),
        ),
      );
    },
    [
      initialPointerPositionX,
      recordIndexKanbanColumnWidth,
      recordBoardId,
      setDragSelectionStartEnabled,
    ],
  );

  const handleResizeEnd = useCallback<PointerEventListener>(
    ({ x }) => {
      if (!isDefined(initialPointerPositionX)) {
        return;
      }

      setInitialPointerPositionX(null);
      setDragSelectionStartEnabled(true);

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
      setDragSelectionStartEnabled,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: isResizing,
    onMouseMove: handleResizeMove,
    onMouseUp: handleResizeEnd,
  });

  return { isResizing, handleResizeStart };
};
