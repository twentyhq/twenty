import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { RecordTableColumnAggregateFooterDropdownMoreOptionsContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownMoreOptionsContent';
import { RecordTableColumnAggregateFooterMenuContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterMenuContent';

export const RecordTableColumnAggregateFooterDropdownContent = () => {
  const { currentContentId } = useDropdown({
    context: RecordTableColumnAggregateFooterDropdownContext,
  });

  switch (currentContentId) {
    case 'moreAggregateOperationOptions':
      return <RecordTableColumnAggregateFooterDropdownMoreOptionsContent />;
    default:
      return <RecordTableColumnAggregateFooterMenuContent />;
  }
};
