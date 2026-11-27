import { ConditionalAvailabilityFilterAddFilterRuleSelect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterAddFilterRuleSelect';
import { ConditionalAvailabilityFilterBuilderEffect } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterBuilderEffect';
import { ConditionalAvailabilityFilterColumn } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterColumn';
import { ConditionalAvailabilityFilterGroupColumn } from '@/conditional-availability/filter-builder/components/ConditionalAvailabilityFilterGroupColumn';
import {
  ConditionalAvailabilityFilterBuilderContextProvider,
  useConditionalAvailabilityFilterBuilderContextOrThrow,
} from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { ConditionalAvailabilityFilterGroupComponentInstanceContext } from '@/conditional-availability/filter-builder/states/context/ConditionalAvailabilityFilterGroupComponentInstanceContext';
import { currentConditionalAvailabilityFilterGroupComponentState } from '@/conditional-availability/filter-builder/states/currentConditionalAvailabilityFilterGroupComponentState';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
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

type ConditionalAvailabilityFilterBuilderProps = {
  instanceId: string;
  filterFields: ConditionalAvailabilityFilterField[];
  defaultValue: ConditionalAvailabilityFilterGroup;
  readonly?: boolean;
  onFilterSettingsUpdate: (
    filterSettings: ConditionalAvailabilityFilterGroup,
  ) => void;
};

const ConditionalAvailabilityFilterBuilderConditions = ({
  filterFields,
}: {
  filterFields: ConditionalAvailabilityFilterField[];
}) => {
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();
  const currentConditionalAvailabilityFilterGroup = useAtomComponentStateValue(
    currentConditionalAvailabilityFilterGroupComponentState,
  );

  if (!isDefined(currentConditionalAvailabilityFilterGroup)) {
    return null;
  }

  return (
    <StyledContainer>
      {isNonEmptyArray(currentConditionalAvailabilityFilterGroup.children) && (
        <StyledChildContainer>
          {currentConditionalAvailabilityFilterGroup.children.map(
            (filterGroupChild, filterGroupChildIndex) =>
              filterGroupChild.type === 'filterGroup' ? (
                <ConditionalAvailabilityFilterGroupColumn
                  key={filterGroupChild.id}
                  filterFields={filterFields}
                  parentFilterGroup={currentConditionalAvailabilityFilterGroup}
                  filterGroup={filterGroupChild}
                  filterGroupIndex={filterGroupChildIndex}
                />
              ) : (
                <ConditionalAvailabilityFilterColumn
                  key={filterGroupChild.id}
                  filterFields={filterFields}
                  filterGroup={currentConditionalAvailabilityFilterGroup}
                  filter={filterGroupChild}
                  filterIndex={filterGroupChildIndex}
                />
              ),
          )}
        </StyledChildContainer>
      )}
      {!readonly && (
        <StyledAddFilterRuleContainer>
          <ConditionalAvailabilityFilterAddFilterRuleSelect
            filterGroup={currentConditionalAvailabilityFilterGroup}
          />
        </StyledAddFilterRuleContainer>
      )}
    </StyledContainer>
  );
};

export const ConditionalAvailabilityFilterBuilder = ({
  instanceId,
  filterFields,
  defaultValue,
  readonly = false,
  onFilterSettingsUpdate,
}: ConditionalAvailabilityFilterBuilderProps) => (
  <ConditionalAvailabilityFilterGroupComponentInstanceContext.Provider
    value={{ instanceId }}
  >
    <ConditionalAvailabilityFilterBuilderContextProvider
      value={{ onFilterSettingsUpdate, readonly }}
    >
      <ConditionalAvailabilityFilterBuilderConditions
        filterFields={filterFields}
      />
    </ConditionalAvailabilityFilterBuilderContextProvider>
    <ConditionalAvailabilityFilterBuilderEffect defaultValue={defaultValue} />
  </ConditionalAvailabilityFilterGroupComponentInstanceContext.Provider>
);
