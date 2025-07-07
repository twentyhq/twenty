import { WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { StepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterAddFilterRuleSelect';
import { StepFilterColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterColumn';
import { StepFilterGroupColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/StepFilterGroupColumn';
import { StepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterContext';
import { getChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/getChildStepFiltersAndChildStepFilterGroups';
import { isStepFilterGroupChildAStepFilterGroup } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/isStepFilterGroupChildAStepFilterGroup';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import styled from '@emotion/styled';
import {
  StepFilter,
  StepFilterGroup,
  StepLogicalOperator,
  StepOperand,
} from 'twenty-shared/src/types/StepFilters';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, useIcons } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

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

type WorkflowEditActionFilterProps = {
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

export type FilterFormData = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
};

export const WorkflowEditActionFilter = ({
  action,
  actionOptions,
}: WorkflowEditActionFilterProps) => {
  const { stepFilterGroups, stepFilters } = action.settings.input;

  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'Filter',
    });

  const { getIcon } = useIcons();

  const rootStepFilterGroup = stepFilterGroups?.find(
    (stepFilterGroup) => !isDefined(stepFilterGroup?.parentStepFilterGroupId),
  );

  const { childStepFiltersAndChildStepFilterGroups } =
    getChildStepFiltersAndChildStepFilterGroups({
      stepFilterGroupId: rootStepFilterGroup?.id ?? '',
      stepFilterGroups: stepFilterGroups ?? [],
      stepFilters: stepFilters ?? [],
    });

  const handleUpsertStepFilterGroup = async (
    stepFilterGroup: StepFilterGroup,
  ) => {
    if (actionOptions.readonly === true) return;

    const updatedStepFilterGroups = [...(stepFilterGroups ?? [])];
    const existingIndex = updatedStepFilterGroups.findIndex(
      (g) => g.id === stepFilterGroup.id,
    );

    if (existingIndex >= 0) {
      updatedStepFilterGroups[existingIndex] = stepFilterGroup;
    } else {
      updatedStepFilterGroups.push(stepFilterGroup);
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: updatedStepFilterGroups,
          stepFilters: stepFilters ?? [],
        },
      },
    });
  };

  const handleUpsertStepFilter = async (stepFilter: StepFilter) => {
    if (actionOptions.readonly === true) return;

    const updatedStepFilters = [...(stepFilters ?? [])];
    const existingIndex = updatedStepFilters.findIndex(
      (f) => f.id === stepFilter.id,
    );

    if (existingIndex >= 0) {
      updatedStepFilters[existingIndex] = stepFilter;
    } else {
      updatedStepFilters.push(stepFilter);
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: stepFilterGroups ?? [],
          stepFilters: updatedStepFilters,
        },
      },
    });
  };

  const handleDeleteStepFilter = async (stepFilterId: string) => {
    if (actionOptions.readonly === true) return;

    const updatedStepFilters = (stepFilters ?? []).filter(
      (f) => f.id !== stepFilterId,
    );

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: stepFilterGroups ?? [],
          stepFilters: updatedStepFilters,
        },
      },
    });
  };

  const handleDeleteStepFilterGroup = async (stepFilterGroupId: string) => {
    if (actionOptions.readonly === true) return;

    const updatedStepFilterGroups = (stepFilterGroups ?? []).filter(
      (g) => g.id !== stepFilterGroupId,
    );

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: updatedStepFilterGroups,
          stepFilters: stepFilters ?? [],
        },
      },
    });
  };

  const handleAddFirstFilter = async () => {
    if (actionOptions.readonly === true) return;

    const newStepFilterGroup: StepFilterGroup = {
      id: v4(),
      logicalOperator: StepLogicalOperator.AND,
    };

    const newStepFilter: StepFilter = {
      id: v4(),
      type: 'text',
      label: 'New Filter',
      value: '',
      operand: StepOperand.EQ,
      displayValue: '',
      stepFilterGroupId: newStepFilterGroup.id,
      stepOutputKey: '',
      positionInStepFilterGroup: 0,
    };

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: [newStepFilterGroup],
          stepFilters: [newStepFilter],
        },
      },
    });
  };

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>
        <StepFilterContext.Provider
          value={{
            readonly: actionOptions.readonly,
            upsertStepFilterGroup: handleUpsertStepFilterGroup,
            upsertStepFilter: handleUpsertStepFilter,
            deleteStepFilter: handleDeleteStepFilter,
            deleteStepFilterGroup: handleDeleteStepFilterGroup,
          }}
        >
          {isDefined(rootStepFilterGroup) ? (
            <StyledContainer>
              <StyledChildContainer>
                {childStepFiltersAndChildStepFilterGroups.map(
                  (stepFilterGroupChild, stepFilterGroupChildIndex) =>
                    isStepFilterGroupChildAStepFilterGroup(
                      stepFilterGroupChild,
                    ) ? (
                      <StepFilterGroupColumn
                        key={stepFilterGroupChild.id}
                        parentStepFilterGroup={rootStepFilterGroup}
                        stepFilterGroup={stepFilterGroupChild}
                        stepFilterGroupIndex={stepFilterGroupChildIndex}
                        stepFilterGroups={stepFilterGroups}
                        stepFilters={stepFilters}
                      />
                    ) : (
                      <StepFilterColumn
                        key={stepFilterGroupChild.id}
                        stepFilterGroup={rootStepFilterGroup}
                        stepFilter={stepFilterGroupChild}
                        stepFilterIndex={stepFilterGroupChildIndex}
                      />
                    ),
                )}
              </StyledChildContainer>
              {!actionOptions.readonly && (
                <StepFilterAddFilterRuleSelect
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
              onClick={handleAddFirstFilter}
              ariaLabel="Add first filter"
              title="Add first filter"
              disabled={actionOptions.readonly}
            />
          )}
        </StepFilterContext.Provider>
      </WorkflowStepBody>
    </>
  );
};
