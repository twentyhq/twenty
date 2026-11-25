import { ConditionalAvailabilityFilterAddFilterRuleSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterAddFilterRuleSelect';
import { ConditionalAvailabilityFilterColumn } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterColumn';
import { ConditionalAvailabilityFilterGroupColumn } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterGroupColumn';
import { ConditionalAvailabilityFilterBuilderContextProvider } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

const StyledAddFilterRuleContainer = styled.div`
  align-self: flex-start;
`;

type ConditionalAvailabilityFilterBuilderProps = {
  filterGroup: ConditionalAvailabilityFilterGroup;
  onFilterGroupChange: (
    filterGroup: ConditionalAvailabilityFilterGroup,
  ) => void;
  roleOptions: SelectOption<string>[];
  workspaceMemberOptions: SelectOption<string>[];
  isReadOnly?: boolean;
};

export const ConditionalAvailabilityFilterBuilder = ({
  filterGroup,
  onFilterGroupChange,
  roleOptions,
  workspaceMemberOptions,
  isReadOnly = false,
}: ConditionalAvailabilityFilterBuilderProps) => (
  <ConditionalAvailabilityFilterBuilderContextProvider
    value={{
      rootFilterGroup: filterGroup,
      onRootFilterGroupChange: onFilterGroupChange,
      roleOptions,
      workspaceMemberOptions,
      isReadOnly,
    }}
  >
    <StyledContainer>
      {isNonEmptyArray(filterGroup.children) && (
        <StyledChildContainer>
          {filterGroup.children.map(
            (filterGroupChild, filterGroupChildIndex) =>
              filterGroupChild.type === 'filterGroup' ? (
                <ConditionalAvailabilityFilterGroupColumn
                  key={filterGroupChild.id}
                  parentFilterGroup={filterGroup}
                  filterGroup={filterGroupChild}
                  filterGroupIndex={filterGroupChildIndex}
                />
              ) : (
                <ConditionalAvailabilityFilterColumn
                  key={filterGroupChild.id}
                  filterGroup={filterGroup}
                  filter={filterGroupChild}
                  filterIndex={filterGroupChildIndex}
                />
              ),
          )}
        </StyledChildContainer>
      )}
      {!isReadOnly && (
        <StyledAddFilterRuleContainer>
          <ConditionalAvailabilityFilterAddFilterRuleSelect
            filterGroup={filterGroup}
          />
        </StyledAddFilterRuleContainer>
      )}
    </StyledContainer>
  </ConditionalAvailabilityFilterBuilderContextProvider>
);
