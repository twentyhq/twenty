import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordBoardColumnWidthComponentState =
  createAtomComponentState<number>({
    key: 'recordBoardColumnWidthComponentState',
    defaultValue: RECORD_BOARD_COLUMN_WIDTH,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
