import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { RecordBoardColumnHeaderAggregateDropdownFieldsContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownFieldsContent';
import { RecordBoardColumnHeaderAggregateDropdownMenuContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMenuContent';

export const AggregateDropdownContent = () => {
  const { currentContentId } = useDropdown({
    context: RecordBoardColumnHeaderAggregateDropdownContext,
  });

  switch (currentContentId) {
    case 'aggregateFields':
      return <RecordBoardColumnHeaderAggregateDropdownFieldsContent />;
    default:
      return <RecordBoardColumnHeaderAggregateDropdownMenuContent />;
  }
};
