import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordGroupAggregateDropdownButton } from '@/object-record/record-group/components/RecordGroupAggregateDropdownButton';
import { RecordGroupAggregateDropdownContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownContent';
import { RecordGroupAggregateDropdownComponentInstanceContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownComponentInstanceContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
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
  return (
    <RecordGroupAggregateDropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <StyledContainer>
        <DropdownRoot dropdownId={dropdownId} type="picker">
          <RecordGroupAggregateDropdownButton
            dropdownId={dropdownId}
            value={aggregateValue}
            tooltip={aggregateLabel}
          />
          <DropdownContent
            aria-label={t`Aggregate`}
            align="end"
            sideOffset={DROPDOWN_OFFSET_Y}
          >
            <RecordGroupAggregateDropdownContent
              objectMetadataItem={objectMetadataItem}
            />
          </DropdownContent>
        </DropdownRoot>
      </StyledContainer>
    </RecordGroupAggregateDropdownComponentInstanceContext.Provider>
  );
};
