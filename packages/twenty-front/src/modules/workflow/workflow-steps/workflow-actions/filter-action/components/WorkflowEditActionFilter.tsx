import { WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowStepFilterAddFilterRuleSelect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterAddFilterRuleSelect';
import { WorkflowStepFilterColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterColumn';
import { WorkflowStepFilterGroupColumn } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterGroupColumn';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
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

  const handleUpsertStepFilterSettings = async ({
    stepFilterGroupToUpsert,
    stepFilterToUpsert,
  }: {
    stepFilterGroupToUpsert?: StepFilterGroup;
    stepFilterToUpsert?: StepFilter;
  }) => {
    if (actionOptions.readonly === true) return;

    const updatedStepFilterGroups = [...(stepFilterGroups ?? [])];
    const updatedStepFilters = [...(stepFilters ?? [])];

    if (isDefined(stepFilterGroupToUpsert)) {
      const existingIndex = updatedStepFilterGroups.findIndex(
        (g) => g.id === stepFilterGroupToUpsert.id,
      );

      if (existingIndex >= 0) {
        updatedStepFilterGroups[existingIndex] = stepFilterGroupToUpsert;
      } else {
        updatedStepFilterGroups.push(stepFilterGroupToUpsert);
      }
    }

    if (isDefined(stepFilterToUpsert)) {
      const existingIndex = updatedStepFilters.findIndex(
        (f) => f.id === stepFilterToUpsert.id,
      );

      if (existingIndex >= 0) {
        updatedStepFilters[existingIndex] = stepFilterToUpsert;
      } else {
        updatedStepFilters.push(stepFilterToUpsert);
      }
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: updatedStepFilterGroups,
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

    const updatedStepFilters = (stepFilters ?? []).filter(
      (f) => f.stepFilterGroupId !== stepFilterGroupId,
    );

    const shouldResetStepFilterSettings =
      updatedStepFilterGroups.length === 1 &&
      updatedStepFilterGroups[0].id === rootStepFilterGroup?.id &&
      updatedStepFilters.length === 0;

    if (shouldResetStepFilterSettings) {
      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            stepFilterGroups: [],
            stepFilters: [],
          },
        },
      });
    } else {
      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            stepFilterGroups: updatedStepFilterGroups,
            stepFilters: updatedStepFilters,
          },
        },
      });
    }
  };

  const handleDeleteStepFilter = async (stepFilterId: string) => {
    if (actionOptions.readonly === true) return;

    const deletedStepFilter = stepFilters?.find((f) => f.id === stepFilterId);

    if (!isDefined(deletedStepFilter)) return;

    const updatedStepFilters = (stepFilters ?? []).filter(
      (f) => f.id !== stepFilterId,
    );

    const parentStepFilterGroup = stepFilterGroups?.find(
      (g) => g.id === deletedStepFilter.stepFilterGroupId,
    );

    const stepFiltersInParentStepFilterGroup = updatedStepFilters?.filter(
      (f) => f.stepFilterGroupId === parentStepFilterGroup?.id,
    );

    const stepFilterGroupsInParentStepFilterGroup = stepFilterGroups?.filter(
      (g) => g.parentStepFilterGroupId === parentStepFilterGroup?.id,
    );

    const shouldDeleteParentStepFilterGroup =
      stepFiltersInParentStepFilterGroup?.length === 0 &&
      stepFilterGroupsInParentStepFilterGroup?.length === 0;

    const updatedStepFilterGroups = shouldDeleteParentStepFilterGroup
      ? (stepFilterGroups ?? []).filter(
          (g) => g.id !== parentStepFilterGroup?.id,
        )
      : stepFilterGroups;

    const shouldResetStepFilterSettings =
      updatedStepFilterGroups.length === 1 &&
      updatedStepFilterGroups[0].id === rootStepFilterGroup?.id &&
      updatedStepFilters.length === 0;

    if (shouldResetStepFilterSettings) {
      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            stepFilterGroups: [],
            stepFilters: [],
          },
        },
      });
    } else {
      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            ...action.settings.input,
            stepFilters: updatedStepFilters,
            stepFilterGroups: updatedStepFilterGroups,
          },
        },
      });
    }
  };

  const initiateStepFilterSettings = async () => {
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
        <WorkflowStepFilterContext.Provider
          value={{
            readonly: actionOptions.readonly,
            upsertStepFilterSettings: handleUpsertStepFilterSettings,
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
                      <WorkflowStepFilterGroupColumn
                        key={stepFilterGroupChild.id}
                        parentStepFilterGroup={rootStepFilterGroup}
                        stepFilterGroup={stepFilterGroupChild}
                        stepFilterGroupIndex={stepFilterGroupChildIndex}
                        stepFilterGroups={stepFilterGroups}
                        stepFilters={stepFilters}
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
              onClick={initiateStepFilterSettings}
              ariaLabel="Add first filter"
              title="Add first filter"
              disabled={actionOptions.readonly}
            />
          )}
        </WorkflowStepFilterContext.Provider>
      </WorkflowStepBody>
    </>
  );
};
