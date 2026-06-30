import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexKanbanColumnWidthComponentState =
  createAtomComponentState<number>({
    key: 'recordIndexKanbanColumnWidthComponentState',
    defaultValue: RECORD_BOARD_COLUMN_WIDTH,
    componentInstanceContext: ViewComponentInstanceContext,
  });
