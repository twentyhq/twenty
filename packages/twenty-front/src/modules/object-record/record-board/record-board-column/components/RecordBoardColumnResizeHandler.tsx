import { useIsMobile } from 'twenty-ui/utilities';

import { useResizeBoardColumn } from '@/object-record/record-board/record-board-column/hooks/useResizeBoardColumn';
import { RecordColumnResizeHandle } from '@/object-record/record-index/components/RecordColumnResizeHandle';

export const RecordBoardColumnResizeHandler = () => {
  const isMobile = useIsMobile();

  const { isResizing, handleResizeStart } = useResizeBoardColumn();

  if (isMobile) {
    return null;
  }

  return (
    <RecordColumnResizeHandle
      isResizing={isResizing}
      position="right"
      onPointerDown={handleResizeStart}
    />
  );
};
