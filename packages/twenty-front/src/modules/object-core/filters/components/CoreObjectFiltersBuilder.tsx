import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreObjectFilterAddRuleButton } from '@/object-core/filters/components/CoreObjectFilterAddRuleButton';
import { CoreObjectFilterColumn } from '@/object-core/filters/components/CoreObjectFilterColumn';
import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { WorkflowEditActionFilterBodyEffect } from '@/workflow/workflow-steps/filters/components/WorkflowEditActionFilterBodyEffect';
import { WorkflowStepFilterAddRootStepFilterButton } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddRootStepFilterButton';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { rootLevelStepFilterGroupComponentSelector } from '@/workflow/workflow-steps/filters/states/rootLevelStepFilterGroupComponentSelector';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { isStepFilterGroupChildAStepFilterGroup } from '@/workflow/workflow-steps/filters/utils/isStepFilterGroupChildAStepFilterGroup';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledConditions = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${themeCssVariables.spacing[0]};
`;

type CoreObjectFiltersBuilderProps = {
  instanceId: string;
  filterFields: CoreObjectFilterField[];
  defaultValue?: FilterSettings;
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => void;
};

const CoreObjectFiltersBuilderConditions = ({
  filterFields,
}: {
  filterFields: CoreObjectFilterField[];
}) => {
  const rootStepFilterGroup = useAtomComponentSelectorValue(
    rootLevelStepFilterGroupComponentSelector,
  );

  const { childStepFiltersAndChildStepFilterGroups } =
    useChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId: rootStepFilterGroup?.id ?? '',
    });

  return (
    <StyledConditions>
      <InputLabel>{t`Conditions`}</InputLabel>
      {isDefined(rootStepFilterGroup) ? (
        <StyledContainer>
          <StyledChildContainer>
            {childStepFiltersAndChildStepFilterGroups
              .filter(
                (stepFilterGroupChild): stepFilterGroupChild is StepFilter =>
                  !isStepFilterGroupChildAStepFilterGroup(stepFilterGroupChild),
              )
              .map((stepFilter, stepFilterIndex) => (
                <CoreObjectFilterColumn
                  key={stepFilter.id}
                  filterFields={filterFields}
                  stepFilterGroup={rootStepFilterGroup}
                  stepFilter={stepFilter}
                  stepFilterIndex={stepFilterIndex}
                />
              ))}
          </StyledChildContainer>
          <CoreObjectFilterAddRuleButton
            stepFilterGroup={rootStepFilterGroup}
          />
        </StyledContainer>
      ) : (
        <WorkflowStepFilterAddRootStepFilterButton />
      )}
    </StyledConditions>
  );
};

export const CoreObjectFiltersBuilder = ({
  instanceId,
  filterFields,
  defaultValue,
  onFilterSettingsUpdate,
}: CoreObjectFiltersBuilderProps) => {
  return (
    <StepFiltersComponentInstanceContext.Provider value={{ instanceId }}>
      <StepFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
        <WorkflowStepFilterContext.Provider
          value={{
            stepId: instanceId,
            onFilterSettingsUpdate,
          }}
        >
          <CoreObjectFiltersBuilderConditions filterFields={filterFields} />
        </WorkflowStepFilterContext.Provider>
        <WorkflowEditActionFilterBodyEffect defaultValue={defaultValue} />
      </StepFilterGroupsComponentInstanceContext.Provider>
    </StepFiltersComponentInstanceContext.Provider>
  );
};
