import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';

export const getRecordBoardCardFocusId = ({
  recordBoardId,
  cardIndexes,
}: {
  recordBoardId: string;
  cardIndexes: BoardCardIndexes;
}) => {
  return `${recordBoardId}-board-card-${cardIndexes.columnIndex}-${cardIndexes.rowIndex}`;
};
