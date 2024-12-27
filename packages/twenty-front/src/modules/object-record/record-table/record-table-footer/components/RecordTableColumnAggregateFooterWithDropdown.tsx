import { useCurrentContentId } from '@/dropdown/hooks/useCurrentContentId';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableColumnAggregateFooterDropdownContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContent';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { RecordTableColumnAggregateFooterValue } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterValue';
import { useAggregateRecordsForRecordTableColumnFooter } from '@/object-record/record-table/record-table-footer/hooks/useAggregateRecordsForRecordTableColumnFooter';
import { RecordTableFooterAggregateContentId } from '@/object-record/record-table/record-table-footer/types/RecordTableFooterAggregateContentId';
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
  const { currentContentId, handleContentChange, handleResetContent } =
    useCurrentContentId<RecordTableFooterAggregateContentId>();

  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  const handleDropdownOpen = useCallback(() => {
    toggleScrollXWrapper(false);
    toggleScrollYWrapper(false);
  }, [toggleScrollXWrapper, toggleScrollYWrapper]);

  const handleDropdownClose = useCallback(() => {
    handleResetContent();
    toggleScrollXWrapper(true);
    toggleScrollYWrapper(true);
  }, [handleResetContent, toggleScrollXWrapper, toggleScrollYWrapper]);

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
        <RecordTableColumnAggregateFooterDropdownContext.Provider
          value={{
            currentContentId,
            onContentChange: handleContentChange,
            resetContent: handleResetContent,
            dropdownId: dropdownId,
            fieldMetadataId: column.fieldMetadataId,
          }}
        >
          <RecordTableColumnAggregateFooterDropdownContent />
        </RecordTableColumnAggregateFooterDropdownContext.Provider>
      }
      dropdownOffset={{ x: -1 }}
      dropdownPlacement="bottom-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
