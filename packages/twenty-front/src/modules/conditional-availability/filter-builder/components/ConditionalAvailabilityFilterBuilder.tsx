import { ConditionalAvailabilityFilterAddFilterRuleSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterAddFilterRuleSelect';
import { ConditionalAvailabilityFilterColumn } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterColumn';
import { ConditionalAvailabilityFilterGroupColumn } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterGroupColumn';
import { ConditionalAvailabilityFilterBuilderContextProvider } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilterBuilderContextValue } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterBuilderContextValue';
import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  width: 100%;
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledAddFilterRuleContainer = styled.div`
  align-self: flex-start;
`;

type ConditionalAvailabilityFilterBuilderProps =
  ConditionalAvailabilityFilterBuilderContextValue;

export const ConditionalAvailabilityFilterBuilder = ({
  rootFilterGroup,
  onRootFilterGroupChange,
  roleOptions,
  workspaceMemberOptions,
  isReadOnly,
}: ConditionalAvailabilityFilterBuilderProps) => (
  <ConditionalAvailabilityFilterBuilderContextProvider
    value={{
      rootFilterGroup,
      onRootFilterGroupChange,
      roleOptions,
      workspaceMemberOptions,
      isReadOnly,
    }}
  >
    <StyledContainer>
      {isNonEmptyArray(rootFilterGroup.children) && (
        <StyledChildContainer>
          {rootFilterGroup.children.map(
            (filterGroupChild, filterGroupChildIndex) =>
              filterGroupChild.type === 'filterGroup' ? (
                <ConditionalAvailabilityFilterGroupColumn
                  key={filterGroupChild.id}
                  parentFilterGroup={rootFilterGroup}
                  filterGroup={filterGroupChild}
                  filterGroupIndex={filterGroupChildIndex}
                />
              ) : (
                <ConditionalAvailabilityFilterColumn
                  key={filterGroupChild.id}
                  filterGroup={rootFilterGroup}
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
            filterGroup={rootFilterGroup}
          />
        </StyledAddFilterRuleContainer>
      )}
    </StyledContainer>
  </ConditionalAvailabilityFilterBuilderContextProvider>
);
