import { RecordBoardColumnContextProvider } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnContextProvider';
import { RecordBoardColumnHeader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeader';

type RecordBoardColumnHeaderWrapperProps = {
  columnId: string;
};

export const RecordBoardColumnHeaderWrapper = ({
  columnId,
}: RecordBoardColumnHeaderWrapperProps) => {
  return (
    <RecordBoardColumnContextProvider recordBoardColumnId={columnId}>
      <RecordBoardColumnHeader />
    </RecordBoardColumnContextProvider>
  );
};
