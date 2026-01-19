import { RecordBoardClickOutsideEffect } from '@/object-record/record-board/components/RecordBoardClickOutsideEffect';
import { RecordBoardDataChangedEffect } from '@/object-record/record-board/components/RecordBoardDataChangedEffect';
import { RecordBoardQueryEffect } from '@/object-record/record-board/components/RecordBoardQueryEffect';
import { RecordBoardScrollToFocusedCardEffect } from '@/object-record/record-board/components/RecordBoardScrollToFocusedCardEffect';
import { RecordBoardSelectRecordsEffect } from '@/object-record/record-board/components/RecordBoardSelectRecordsEffect';
import { RecordBoardSSESubscribeEffect } from '@/object-record/record-board/components/RecordBoardSSESubscribeEffect';
import { RecordBoardStickyHeaderEffect } from '@/object-record/record-board/components/RecordBoardStickyHeaderEffect';
import { RecordBoardDeactivateBoardCardEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardDeactivateBoardCardEffect';

export const RecordBoardEffects = () => {
  return (
    <>
      <RecordBoardStickyHeaderEffect />
      <RecordBoardScrollToFocusedCardEffect />
      <RecordBoardDeactivateBoardCardEffect />
      <RecordBoardSSESubscribeEffect />
      <RecordBoardDataChangedEffect />
      <RecordBoardQueryEffect />
      <RecordBoardSelectRecordsEffect />
      <RecordBoardClickOutsideEffect />
    </>
  );
};
