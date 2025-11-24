import { useDropdownContextCurrentContentId } from '@/dropdown-context-state-management/hooks/useDropdownContextCurrentContentId';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext } from '@/object-record/record-board/contexts/RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext';
import { RecordBoardColumnHeaderAggregateDropdownButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownButton';
import { AggregateDropdownContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContent';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { type RecordBoardColumnHeaderAggregateContentId } from '@/object-record/record-board/types/RecordBoardColumnHeaderAggregateContentId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import styled from '@emotion/styled';
import { type Nullable } from 'twenty-shared/types';

type RecordBoardColumnHeaderAggregateDropdownProps = {
  aggregateValue?: Nullable<string | number>;
  aggregateLabel?: Nullable<string>;
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
  } =
    useDropdownContextCurrentContentId<RecordBoardColumnHeaderAggregateContentId>();

  return (
    <RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <StyledContainer>
        <Dropdown
          onClose={handleResetContent}
          dropdownId={dropdownId}
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
