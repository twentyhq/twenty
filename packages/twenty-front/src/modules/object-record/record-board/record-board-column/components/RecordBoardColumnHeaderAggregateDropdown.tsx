import { DROPDOWN_OFFSET_Y } from '@/dropdown/constants/DropdownOffsetY';
import { DROPDOWN_WIDTH } from '@/dropdown/constants/DropdownWidth';
import { useCurrentContentId } from '@/dropdown/hooks/useCurrentContentId';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext } from '@/object-record/record-board/contexts/RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext';
import { RecordBoardColumnHeaderAggregateDropdownButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownButton';
import { AggregateDropdownContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContent';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { RecordBoardColumnHotkeyScope } from '@/object-record/record-board/types/BoardColumnHotkeyScope';
import { RecordBoardColumnHeaderAggregateContentId } from '@/object-record/record-board/types/RecordBoardColumnHeaderAggregateContentId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import styled from '@emotion/styled';

type RecordBoardColumnHeaderAggregateDropdownProps = {
  aggregateValue?: string | number;
  aggregateLabel?: string;
  objectMetadataItem: ObjectMetadataItem;
  dropdownId: string;
};

const StyledContainer = styled.div`
  overflow: hidden;
`;

export const RecordBoardColumnHeaderAggregateDropdown = ({
  objectMetadataItem,
  aggregateValue,
  aggregateLabel,
  dropdownId,
}: RecordBoardColumnHeaderAggregateDropdownProps) => {
  const {
    currentContentId,
    handleContentChange,
    handleResetContent,
    previousContentId,
  } = useCurrentContentId<RecordBoardColumnHeaderAggregateContentId>();

  return (
    <RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <StyledContainer>
        <Dropdown
          onClose={handleResetContent}
          dropdownId={dropdownId}
          dropdownHotkeyScope={{
            scope: RecordBoardColumnHotkeyScope.ColumnHeader,
          }}
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
                previousContentId,
                objectMetadataItem: objectMetadataItem,
                dropdownId: dropdownId,
              }}
            >
              <AggregateDropdownContent />
            </RecordBoardColumnHeaderAggregateDropdownContext.Provider>
          }
        />
      </StyledContainer>
    </RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext.Provider>
  );
};
