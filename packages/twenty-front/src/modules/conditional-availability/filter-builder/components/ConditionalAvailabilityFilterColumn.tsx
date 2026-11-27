import { ConditionalAvailabilityFilterFieldSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterFieldSelect';
import { ConditionalAvailabilityFilterFieldValueInput } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterFieldValueInput';
import { ConditionalAvailabilityFilterLogicalOperatorCell } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterLogicalOperatorCell';
import { ConditionalAvailabilityFilterOperatorSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterOperatorSelect';
import { ConditionalAvailabilityFilterOptionsDropdown } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterOptionsDropdown';
import { ConditionalAvailabilityFilterValueInput } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterValueInput';
import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { findConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/utils/findConditionalAvailabilityFilterField';
import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
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

  const selectedField = findConditionalAvailabilityFilterField({
    filterFields,
    filter,
  });

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
      <ConditionalAvailabilityFilterFieldSelect
        filterFields={filterFields}
        filter={filter}
      />
      <ConditionalAvailabilityFilterOperatorSelect
        filterFields={filterFields}
        filter={filter}
      />
      {isDefined(selectedField) && 'field' in selectedField ? (
        <ConditionalAvailabilityFilterFieldValueInput
          key={selectedField.key}
          filterFields={filterFields}
          filter={filter}
          type={selectedField.type}
        />
      ) : (
        <ConditionalAvailabilityFilterValueInput
          filterFields={filterFields}
          filter={filter}
        />
      )}
    </AdvancedFilterSidePanelColumn>
  );
};
