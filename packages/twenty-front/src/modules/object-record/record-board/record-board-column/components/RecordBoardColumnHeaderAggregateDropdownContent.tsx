import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { RecordBoardColumnHeaderAggregateDropdownFieldsContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownFieldsContent';
import { RecordBoardColumnHeaderAggregateDropdownMenuContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMenuContent';
import { RecordBoardColumnHeaderAggregateDropdownMoreOptionsContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMoreOptionsContent';

export const AggregateDropdownContent = () => {
  const { currentContentId } = useDropdown({
    context: RecordBoardColumnHeaderAggregateDropdownContext,
  });

  switch (currentContentId) {
    case 'moreAggregateOperationOptions':
      return <RecordBoardColumnHeaderAggregateDropdownMoreOptionsContent />;
    case 'aggregateFields':
      return <RecordBoardColumnHeaderAggregateDropdownFieldsContent />;
    default:
      return <RecordBoardColumnHeaderAggregateDropdownMenuContent />;
  }
};
