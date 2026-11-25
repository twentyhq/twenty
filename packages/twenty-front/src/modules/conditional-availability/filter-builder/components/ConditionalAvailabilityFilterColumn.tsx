import { ConditionalAvailabilityFilterLogicalOperatorCell } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterLogicalOperatorCell';
import { ConditionalAvailabilityFilterOperatorSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterOperatorSelect';
import { ConditionalAvailabilityFilterOptionsDropdown } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterOptionsDropdown';
import { ConditionalAvailabilityFilterValueInput } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterValueInput';
import { ConditionalAvailabilityFilterVariableSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterVariableSelect';
import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
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

type ConditionalAvailabilityFilterColumnProps = {
  filterGroup: ConditionalAvailabilityFilterGroup;
  filter: ConditionalAvailabilityFilter;
  filterIndex: number;
};

export const ConditionalAvailabilityFilterColumn = ({
  filterGroup,
  filter,
  filterIndex,
}: ConditionalAvailabilityFilterColumnProps) => {
  const { isReadOnly } =
    useConditionalAvailabilityFilterBuilderContextOrThrow();

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <ConditionalAvailabilityFilterLogicalOperatorCell
          index={filterIndex}
          filterGroup={filterGroup}
        />
        {!isReadOnly && (
          <ConditionalAvailabilityFilterOptionsDropdown
            filterOrGroup={filter}
          />
        )}
      </StyledContainer>
      <AdvancedFilterSidePanelColumn>
        <ConditionalAvailabilityFilterVariableSelect filter={filter} />
        <ConditionalAvailabilityFilterOperatorSelect filter={filter} />
        <ConditionalAvailabilityFilterValueInput filter={filter} />
      </AdvancedFilterSidePanelColumn>
    </AdvancedFilterSidePanelColumn>
  );
};
