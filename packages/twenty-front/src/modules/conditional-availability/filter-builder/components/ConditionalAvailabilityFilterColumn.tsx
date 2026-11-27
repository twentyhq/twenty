import { ConditionalAvailabilityFilterFieldSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterFieldSelect';
import { ConditionalAvailabilityFilterLogicalOperatorCell } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterLogicalOperatorCell';
import { ConditionalAvailabilityFilterOperatorSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterOperatorSelect';
import { ConditionalAvailabilityFilterOptionsDropdown } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterOptionsDropdown';
import { ConditionalAvailabilityFilterValueInput } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterValueInput';
import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
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

type ConditionalAvailabilityFilterColumnProps = {
  filterFields: ConditionalAvailabilityFilterField[];
  filterGroup: ConditionalAvailabilityFilterGroup;
  filter: ConditionalAvailabilityFilter;
  filterIndex: number;
};

export const ConditionalAvailabilityFilterColumn = ({
  filterFields,
  filterGroup,
  filter,
  filterIndex,
}: ConditionalAvailabilityFilterColumnProps) => {
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <ConditionalAvailabilityFilterLogicalOperatorCell
          index={filterIndex}
          filterGroup={filterGroup}
        />
        {!readonly && (
          <ConditionalAvailabilityFilterOptionsDropdown
            filterOrGroup={filter}
          />
        )}
      </StyledContainer>
      <AdvancedFilterSidePanelColumn>
        <ConditionalAvailabilityFilterFieldSelect
          filterFields={filterFields}
          filter={filter}
        />
        <ConditionalAvailabilityFilterOperatorSelect filter={filter} />
        <ConditionalAvailabilityFilterValueInput
          filterFields={filterFields}
          filter={filter}
        />
      </AdvancedFilterSidePanelColumn>
    </AdvancedFilterSidePanelColumn>
  );
};
