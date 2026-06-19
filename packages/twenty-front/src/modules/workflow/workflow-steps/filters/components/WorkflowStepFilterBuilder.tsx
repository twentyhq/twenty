import { InputLabel } from '@/ui/input/components/InputLabel';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { WorkflowEditActionFilterBodyEffect } from '@/workflow/workflow-steps/filters/components/WorkflowEditActionFilterBodyEffect';
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterAddRootStepFilterButton } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddRootStepFilterButton';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterGroupColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupColumn';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { rootLevelStepFilterGroupComponentSelector } from '@/workflow/workflow-steps/filters/states/rootLevelStepFilterGroupComponentSelector';
import {
  type FilterSettings,
  type FilterSettingsWithPotentiallyDeprecatedOperand,
} from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { isStepFilterGroupChildAStepFilterGroup } from '@/workflow/workflow-steps/filters/utils/isStepFilterGroupChildAStepFilterGroup';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

type WorkflowStepFilterBuilderProps = {
  instanceId: string;
  // Persisted settings can carry deprecated operands; the body effect converts
  // them to core operands when initializing jotai state.
  defaultValue?: FilterSettingsWithPotentiallyDeprecatedOperand;
  readonly?: boolean;
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => void;
};

// The condition columns read jotai component state keyed by instanceId, so they
// must be rendered inside the two ComponentInstanceContext providers.
const WorkflowStepFilterBuilderConditions = ({
  readonly,
}: {
  readonly?: boolean;
}) => {
  const rootStepFilterGroup = useAtomComponentSelectorValue(
    rootLevelStepFilterGroupComponentSelector,
  );

  const { childStepFiltersAndChildStepFilterGroups } =
    useChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId: rootStepFilterGroup?.id ?? '',
    });

  return (
    <>
      <InputLabel>{t`Conditions`}</InputLabel>
      {isDefined(rootStepFilterGroup) ? (
        <StyledContainer>
          <StyledChildContainer>
            {childStepFiltersAndChildStepFilterGroups.map(
              (stepFilterGroupChild, stepFilterGroupChildIndex) =>
                isStepFilterGroupChildAStepFilterGroup(stepFilterGroupChild) ? (
                  <WorkflowStepFilterGroupColumn
                    key={stepFilterGroupChild.id}
                    parentStepFilterGroup={rootStepFilterGroup}
                    stepFilterGroup={stepFilterGroupChild}
                    stepFilterGroupIndex={stepFilterGroupChildIndex}
                  />
                ) : (
                  <WorkflowStepFilterColumn
                    key={stepFilterGroupChild.id}
                    stepFilterGroup={rootStepFilterGroup}
                    stepFilter={stepFilterGroupChild}
                    stepFilterIndex={stepFilterGroupChildIndex}
                  />
                ),
            )}
          </StyledChildContainer>
          {!readonly && (
            <WorkflowStepFilterAddFilterRuleSelect
              stepFilterGroup={rootStepFilterGroup}
            />
          )}
        </StyledContainer>
      ) : (
        <WorkflowStepFilterAddRootStepFilterButton />
      )}
    </>
  );
};

export const WorkflowStepFilterBuilder = ({
  instanceId,
  defaultValue,
  readonly,
  onFilterSettingsUpdate,
}: WorkflowStepFilterBuilderProps) => {
  return (
    <StepFiltersComponentInstanceContext.Provider value={{ instanceId }}>
      <StepFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
        <WorkflowStepFilterContext.Provider
          value={{
            stepId: instanceId,
            readonly,
            onFilterSettingsUpdate,
          }}
        >
          <WorkflowStepFilterBuilderConditions readonly={readonly} />
        </WorkflowStepFilterContext.Provider>
        <WorkflowEditActionFilterBodyEffect
          stepId={instanceId}
          defaultValue={defaultValue}
        />
      </StepFilterGroupsComponentInstanceContext.Provider>
    </StepFiltersComponentInstanceContext.Provider>
  );
};
