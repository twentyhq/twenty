import { RecordTableColumnAggregateFooterAggregateOperationMenuItems } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterAggregateOperationMenuItems';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { Dropdown } from 'twenty-ui/components';

export const RecordTableColumnAggregateFooterDropdownSubmenuContent = ({
  aggregateOperations,
  title,
}: {
  aggregateOperations: ExtendedAggregateOperations[];
  title: string;
}) => {
  return (
    <>
      <Dropdown.Back>{title}</Dropdown.Back>
      <Dropdown.Section>
        <RecordTableColumnAggregateFooterAggregateOperationMenuItems
          aggregateOperations={aggregateOperations}
        />
      </Dropdown.Section>
    </>
  );
};
