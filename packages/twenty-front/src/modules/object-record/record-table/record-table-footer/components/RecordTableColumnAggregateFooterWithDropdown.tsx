import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableColumnAggregateFooterDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdown';
import { RecordTableColumnAggregateFooterValue } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterValue';
import { useAggregateRecordsForRecordTableColumnFooter } from '@/object-record/record-table/record-table-footer/hooks/useAggregateRecordsForRecordTableColumnFooter';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import { useCallback } from 'react';

type RecordTableColumnFooterWithDropdownProps = {
  column: ColumnDefinition<FieldMetadata>;
  isFirstCell: boolean;
  currentRecordGroupId?: string;
};

export const RecordTableColumnFooterWithDropdown = ({
  column,
  currentRecordGroupId,
  isFirstCell,
}: RecordTableColumnFooterWithDropdownProps) => {
  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  const handleDropdownOpen = useCallback(() => {
    toggleScrollXWrapper(false);
    toggleScrollYWrapper(false);
  }, [toggleScrollXWrapper, toggleScrollYWrapper]);

  const handleDropdownClose = useCallback(() => {
    toggleScrollXWrapper(true);
    toggleScrollYWrapper(true);
  }, [toggleScrollXWrapper, toggleScrollYWrapper]);

  const { aggregateValue, aggregateLabel } =
    useAggregateRecordsForRecordTableColumnFooter(column.fieldMetadataId);

  const dropdownId = currentRecordGroupId
    ? `${column.fieldMetadataId}-footer-${currentRecordGroupId}`
    : `${column.fieldMetadataId}-footer`;

  return (
    <Dropdown
      onOpen={handleDropdownOpen}
      onClose={handleDropdownClose}
      dropdownId={dropdownId}
      clickableComponent={
        <RecordTableColumnAggregateFooterValue
          aggregateLabel={aggregateLabel}
          aggregateValue={aggregateValue}
          dropdownId={dropdownId}
          isFirstCell={isFirstCell}
        />
      }
      dropdownComponents={
        <RecordTableColumnAggregateFooterDropdown
          column={column}
          dropdownId={dropdownId}
        />
      }
      dropdownOffset={{ x: -1 }}
      dropdownPlacement="bottom-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
