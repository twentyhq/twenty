import { DROPDOWN_OFFSET_Y } from '@/dropdown/constants/DropdownOffsetY';
import { DROPDOWN_WIDTH } from '@/dropdown/constants/DropdownWidth';
import { useCurrentContentId } from '@/dropdown/hooks/useCurrentContentId';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordBoardColumnHeaderAggregateDropdownButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownButton';
import { AggregateDropdownContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContent';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { AggregateContentId } from '@/object-record/record-board/types/AggregateContentId';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

type RecordBoardColumnHeaderAggregateDropdownProps = {
  aggregateValue: string | number;
  aggregateLabel?: string;
  objectMetadataItem: ObjectMetadataItem;
  dropdownId: string;
};

export const RecordBoardColumnHeaderAggregateDropdown = ({
  objectMetadataItem,
  aggregateValue,
  aggregateLabel,
  dropdownId,
}: RecordBoardColumnHeaderAggregateDropdownProps) => {
  const { currentContentId, handleContentChange, handleResetContent } =
    useCurrentContentId<AggregateContentId>();

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      dropdownMenuWidth={DROPDOWN_WIDTH}
      dropdownOffset={{ y: DROPDOWN_OFFSET_Y }}
      clickableComponent={
        <RecordBoardColumnHeaderAggregateDropdownButton
          dropdownId={dropdownId}
          value={aggregateValue}
          tooltip={aggregateLabel}
        />
      }
      dropdownComponents={
        <RecordBoardColumnHeaderAggregateDropdownContext.Provider
          value={{
            currentContentId,
            onContentChange: handleContentChange,
            resetContent: handleResetContent,
            objectMetadataItem: objectMetadataItem,
            dropdownId: dropdownId,
          }}
        >
          <AggregateDropdownContent />
        </RecordBoardColumnHeaderAggregateDropdownContext.Provider>
      }
    />
  );
};
