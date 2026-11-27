import { ConditionalAvailabilityFilterGroupChildren } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterGroupChildren';
import { ConditionalAvailabilityFilterLogicalOperatorCell } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterLogicalOperatorCell';
import { ConditionalAvailabilityFilterOptionsDropdown } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterOptionsDropdown';
import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

type ConditionalAvailabilityFilterGroupColumnProps = {
  filterFields: ConditionalAvailabilityFilterField[];
  parentFilterGroup: ConditionalAvailabilityFilterGroup;
  filterGroup: ConditionalAvailabilityFilterGroup;
  filterGroupIndex: number;
};

export const ConditionalAvailabilityFilterGroupColumn = ({
  filterFields,
  parentFilterGroup,
  filterGroup,
  filterGroupIndex,
}: ConditionalAvailabilityFilterGroupColumnProps) => {
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <ConditionalAvailabilityFilterLogicalOperatorCell
          index={filterGroupIndex}
          filterGroup={parentFilterGroup}
        />
        {!readonly && (
          <ConditionalAvailabilityFilterOptionsDropdown
            filterOrGroup={filterGroup}
          />
        )}
      </StyledContainer>
      <ConditionalAvailabilityFilterGroupChildren
        filterFields={filterFields}
        filterGroup={filterGroup}
      />
    </AdvancedFilterSidePanelColumn>
  );
};
