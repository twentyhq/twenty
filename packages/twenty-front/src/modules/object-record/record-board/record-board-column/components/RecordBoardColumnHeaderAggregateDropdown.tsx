import { Dropdown } from '@/dropdown/components/Dropdown';
import { useCurrentContentId } from '@/dropdown/hooks/useCurrentContentId';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordBoardColumnHeaderAggregateDropdownButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownButton';
import { AggregateDropdownContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContent';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { AggregateContentId } from '@/object-record/record-board/types/AggregateContentId';

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
