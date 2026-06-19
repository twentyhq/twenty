import { useContext, useLayoutEffect } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { setRecordBoardColumnWidthCssVariable } from '@/object-record/record-board/utils/setRecordBoardColumnWidthCssVariable';
import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// Reflects the persisted kanban column width onto the shared CSS variable read
// by every column (header + body), mirroring RecordTableColumnWidthEffect.
export const RecordBoardColumnWidthEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const recordIndexKanbanColumnWidth = useAtomComponentStateValue(
    recordIndexKanbanColumnWidthComponentState,
  );

  useLayoutEffect(() => {
    setRecordBoardColumnWidthCssVariable(
      recordBoardId,
      recordIndexKanbanColumnWidth,
    );
  }, [recordBoardId, recordIndexKanbanColumnWidth]);

  return null;
};
