import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { FilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterGroupColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterGroupColumn';
import { useAddRootStepFilter } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useAddRootStepFilter';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { rootLevelStepFilterGroupComponentSelector } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/rootLevelStepFilterGroupComponentSelector';
import { isStepFilterGroupChildAStepFilterGroup } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/isStepFilterGroupChildAStepFilterGroup';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

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
  const rootStepFilterGroup = useRecoilComponentValueV2(
    rootLevelStepFilterGroupComponentSelector,
  );

  const { childStepFiltersAndChildStepFilterGroups } =
    useChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId: rootStepFilterGroup?.id ?? '',
    });

  const { addRootStepFilter } = useAddRootStepFilter();

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
        readonly: actionOptions.readonly,
        onFilterSettingsUpdate,
      }}
    >
      <WorkflowStepBody>
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
          <Button
            Icon={IconFilter}
            size="small"
            variant="secondary"
            accent="default"
            onClick={addRootStepFilter}
            ariaLabel="Add first filter"
            title="Add first filter"
            disabled={actionOptions.readonly}
          />
        )}
      </WorkflowStepBody>
    </WorkflowStepFilterContext.Provider>
  );
};
