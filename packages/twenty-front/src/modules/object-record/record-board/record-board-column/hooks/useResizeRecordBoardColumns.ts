import {
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCSSVariableName';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardColumnWidthComponentState } from '@/object-record/record-board/states/recordBoardColumnWidthComponentState';
import { clampRecordBoardColumnWidth } from '@/object-record/record-board/utils/clampRecordBoardColumnWidth';
import { getRecordBoardHtmlId } from '@/object-record/record-board/utils/getRecordBoardHtmlId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateViewKanbanColumnWidth } from '@/views/hooks/useUpdateViewKanbanColumnWidth';

export const useResizeRecordBoardColumns = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const [recordBoardColumnWidth, setRecordBoardColumnWidth] =
    useAtomComponentState(recordBoardColumnWidthComponentState);

  const [isResizing, setIsResizing] = useState(false);

  // oxlint-disable-next-line twenty/no-state-useref
  const cleanupResizeListenersRef = useRef<(() => void) | null>(null);

  const { setDragSelectionStartEnabled } = useDragSelect();
  const { updateViewKanbanColumnWidth } = useUpdateViewKanbanColumnWidth();

  const updatePreviewColumnWidth = (width: number) => {
    document
      .getElementById(getRecordBoardHtmlId(recordBoardId))
      ?.style.setProperty(
        RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME,
        `${width}px`,
      );
  };

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    cleanupResizeListenersRef.current?.();

    const resizeHandle = event.currentTarget;
    const pointerId = event.pointerId;
    const initialPointerPositionX = event.clientX;
    const initialColumnWidth = recordBoardColumnWidth;
    let hasEnded = false;
    let latestColumnWidth = initialColumnWidth;

    resizeHandle.setPointerCapture(pointerId);

    setDragSelectionStartEnabled(false);
    setIsResizing(true);

    const updatePreviewColumnWidthFromClientX = (clientX: number) => {
      const nextWidth = clampRecordBoardColumnWidth(
        initialColumnWidth + clientX - initialPointerPositionX,
      );

      latestColumnWidth = nextWidth;
      updatePreviewColumnWidth(nextWidth);
    };

    const cleanupResizeListeners = () => {
      document.removeEventListener('pointermove', handleDocumentResizeMove);
      document.removeEventListener('pointerup', handleDocumentResizeEnd);
      document.removeEventListener('pointercancel', handleDocumentResizeEnd);

      if (resizeHandle.hasPointerCapture(pointerId)) {
        resizeHandle.releasePointerCapture(pointerId);
      }

      cleanupResizeListenersRef.current = null;
    };

    function handleDocumentResizeMove(event: globalThis.PointerEvent) {
      updatePreviewColumnWidthFromClientX(event.clientX);
    }

    function handleDocumentResizeEnd() {
      if (hasEnded) {
        return;
      }

      hasEnded = true;
      cleanupResizeListeners();

      const nextWidth = Math.round(latestColumnWidth);

      updatePreviewColumnWidth(nextWidth);
      setRecordBoardColumnWidth(nextWidth);
      if (nextWidth !== initialColumnWidth) {
        void updateViewKanbanColumnWidth(nextWidth);
      }
      setIsResizing(false);
      setDragSelectionStartEnabled(true);
    }

    cleanupResizeListenersRef.current = cleanupResizeListeners;

    document.addEventListener('pointermove', handleDocumentResizeMove);
    document.addEventListener('pointerup', handleDocumentResizeEnd);
    document.addEventListener('pointercancel', handleDocumentResizeEnd);
  };

  useEffect(() => {
    return () => {
      const cleanupResizeListeners = cleanupResizeListenersRef.current;

      if (cleanupResizeListeners !== null) {
        cleanupResizeListeners();
        setDragSelectionStartEnabled(true);
      }
    };
  }, [setDragSelectionStartEnabled]);

  return {
    handleResizeStart,
    isResizing,
  };
};
