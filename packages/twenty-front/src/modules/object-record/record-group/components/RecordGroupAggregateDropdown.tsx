import { useDropdownContextCurrentContentId } from '@/dropdown-context-state-management/hooks/useDropdownContextCurrentContentId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordGroupAggregateDropdownButton } from '@/object-record/record-group/components/RecordGroupAggregateDropdownButton';
import { RecordGroupAggregateDropdownContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownContent';
import { RecordGroupAggregateDropdownComponentInstanceContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownComponentInstanceContext';
import { RecordGroupAggregateDropdownContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownContext';
import { type RecordGroupAggregateContentId } from '@/object-record/record-group/types/RecordGroupAggregateContentId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { styled } from '@linaria/react';
import { type Nullable } from 'twenty-shared/types';

type RecordGroupAggregateDropdownProps = {
  aggregateValue?: Nullable<string | number>;
  aggregateLabel?: Nullable<string>;
  objectMetadataItem: EnrichedObjectMetadataItem;
  dropdownId: string;
};

const StyledContainer = styled.div`
  flex-shrink: 0;
`;

export const RecordGroupAggregateDropdown = ({
  objectMetadataItem,
  aggregateValue,
  aggregateLabel,
  dropdownId,
}: RecordGroupAggregateDropdownProps) => {
  const {
    currentContentId,
    handleContentChange,
    handleResetContent,
    previousContentId,
  } = useDropdownContextCurrentContentId<RecordGroupAggregateContentId>();

  return (
    <RecordGroupAggregateDropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <StyledContainer>
        <Dropdown
          onClose={handleResetContent}
          dropdownId={dropdownId}
          dropdownOffset={{ y: DROPDOWN_OFFSET_Y }}
          clickableComponent={
            <RecordGroupAggregateDropdownButton
              dropdownId={dropdownId}
              value={aggregateValue}
              tooltip={aggregateLabel}
            />
          }
          dropdownComponents={
            <RecordGroupAggregateDropdownContext.Provider
              value={{
                currentContentId,
                onContentChange: handleContentChange,
                resetContent: handleResetContent,
                previousContentId,
                objectMetadataItem: objectMetadataItem,
                dropdownId: dropdownId,
              }}
            >
              <RecordGroupAggregateDropdownContent />
            </RecordGroupAggregateDropdownContext.Provider>
          }
        />
      </StyledContainer>
    </RecordGroupAggregateDropdownComponentInstanceContext.Provider>
  );
};
