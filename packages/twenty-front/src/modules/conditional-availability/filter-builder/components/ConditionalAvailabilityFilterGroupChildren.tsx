import { ConditionalAvailabilityFilterAddFilterRuleSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterAddFilterRuleSelect';
import { ConditionalAvailabilityFilterColumn } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterColumn';
import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: start;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[2]};
`;

type ConditionalAvailabilityFilterGroupChildrenProps = {
  filterFields: ConditionalAvailabilityFilterField[];
  filterGroup: ConditionalAvailabilityFilterGroup;
};

export const ConditionalAvailabilityFilterGroupChildren = ({
  filterFields,
  filterGroup,
}: ConditionalAvailabilityFilterGroupChildrenProps) => {
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();

  const childFilters = filterGroup.children.filter(
    (filterGroupChild) => filterGroupChild.type === 'filter',
  );

  return (
    <StyledContainer>
      {childFilters.map((childFilter, childFilterIndex) => (
        <ConditionalAvailabilityFilterColumn
          key={childFilter.id}
          filterFields={filterFields}
          filterGroup={filterGroup}
          filter={childFilter}
          filterIndex={childFilterIndex}
        />
      ))}
      {!readonly && (
        <ConditionalAvailabilityFilterAddFilterRuleSelect
          filterGroup={filterGroup}
        />
      )}
    </StyledContainer>
  );
};
