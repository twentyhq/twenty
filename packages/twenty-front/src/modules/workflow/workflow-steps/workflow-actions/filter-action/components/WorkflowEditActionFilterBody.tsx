import { InputLabel } from '@/ui/input/components/InputLabel';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterAddRootStepFilterButton } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterAddRootStepFilterButton';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterGroupColumn } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterGroupColumn';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { rootLevelStepFilterGroupComponentSelector } from '@/workflow/workflow-steps/filters/states/rootLevelStepFilterGroupComponentSelector';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { isStepFilterGroupChildAStepFilterGroup } from '@/workflow/workflow-steps/filters/utils/isStepFilterGroupChildAStepFilterGroup';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledFilterBodyContainer = styled(WorkflowStepBody)`
  gap: ${({ theme }) => theme.spacing(0)};
`;

type WorkflowEditActionFilterBodyProps = {
  action: WorkflowFilterAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowFilterAction) => void;
      };
};

export const WorkflowEditActionFilterBody = ({
  action,
  actionOptions,
}: WorkflowEditActionFilterBodyProps) => {
  const rootStepFilterGroup = useRecoilComponentValue(
    rootLevelStepFilterGroupComponentSelector,
  );

  const { childStepFiltersAndChildStepFilterGroups } =
    useChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId: rootStepFilterGroup?.id ?? '',
    });

  const onFilterSettingsUpdate = (newFilterSettings: FilterSettings) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: newFilterSettings.stepFilterGroups ?? [],
          stepFilters: newFilterSettings.stepFilters ?? [],
        },
      },
    });
  };

  return (
    <WorkflowStepFilterContext.Provider
      value={{
        stepId: action.id,
        readonly: actionOptions.readonly,
        onFilterSettingsUpdate,
      }}
    >
      <StyledFilterBodyContainer>
        <InputLabel>{t`Conditions`}</InputLabel>
        {isDefined(rootStepFilterGroup) ? (
          <StyledContainer>
            <StyledChildContainer>
              {childStepFiltersAndChildStepFilterGroups.map(
                (stepFilterGroupChild, stepFilterGroupChildIndex) =>
                  isStepFilterGroupChildAStepFilterGroup(
                    stepFilterGroupChild,
                  ) ? (
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
            {!actionOptions.readonly && (
              <WorkflowStepFilterAddFilterRuleSelect
                stepFilterGroup={rootStepFilterGroup}
              />
            )}
          </StyledContainer>
        ) : (
          <WorkflowStepFilterAddRootStepFilterButton />
        )}
      </StyledFilterBodyContainer>
    </WorkflowStepFilterContext.Provider>
  );
};
