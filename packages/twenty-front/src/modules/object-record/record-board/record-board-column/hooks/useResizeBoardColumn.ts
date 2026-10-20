import { useLingui } from '@lingui/react';
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useState,
} from 'react';
import { getLocaleTextDirection } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { getUiZoom } from '@/ui/theme/utils/getUiZoom';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { clampRecordBoardColumnWidth } from '@/object-record/record-board/utils/clampRecordBoardColumnWidth';
import { setRecordBoardColumnWidthCssVariable } from '@/object-record/record-board/utils/setRecordBoardColumnWidthCssVariable';
import { getRecordColumnResizeOffset } from '@/object-record/record-index/utils/getRecordColumnResizeOffset';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateViewKanbanColumnWidth } from '@/views/hooks/useUpdateViewKanbanColumnWidth';

export const useResizeBoardColumn = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { i18n } = useLingui();
  const textDirection = getLocaleTextDirection(i18n.locale);

  const [recordIndexKanbanColumnWidth, setRecordIndexKanbanColumnWidth] =
    useAtomComponentState(recordIndexKanbanColumnWidthComponentState);

  const { updateViewKanbanColumnWidth } = useUpdateViewKanbanColumnWidth();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);

  const isResizing = isDefined(initialPointerPositionX);

  // Captured once per drag: reading computed style on every move forces a style recalc.
  const [dragUiZoom, setDragUiZoom] = useState(1);

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse') {
        return;
      }

      setDragSelectionStartEnabled(false);
      setDragUiZoom(getUiZoom());
      setInitialPointerPositionX(event.clientX);
    },
    [setDragSelectionStartEnabled],
  );

  const handleResizeMove = useCallback<PointerEventListener>(
    ({ x, event }) => {
      if (!isDefined(initialPointerPositionX)) {
        return;
      }

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
          recordIndexKanbanColumnWidth +
            getRecordColumnResizeOffset({
              pointerDeltaX: x - initialPointerPositionX,
              uiZoom: dragUiZoom,
              textDirection,
            }),
        ),
      );
    },
    [
      initialPointerPositionX,
      recordIndexKanbanColumnWidth,
      recordBoardId,
      setDragSelectionStartEnabled,
      dragUiZoom,
      textDirection,
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
          recordIndexKanbanColumnWidth +
            getRecordColumnResizeOffset({
              pointerDeltaX: x - initialPointerPositionX,
              uiZoom: dragUiZoom,
              textDirection,
            }),
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
      dragUiZoom,
      textDirection,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: isResizing,
    onMouseMove: handleResizeMove,
    onMouseUp: handleResizeEnd,
  });

  return { isResizing, handleResizeStart };
};
