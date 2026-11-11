import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { computeWorkflowStepConditionFromFilter } from 'twenty-shared/workflow';

import { type WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowStepConditionInput } from '@/workflow/workflow-steps/conditions/components/WorkflowStepConditionInput';
import { WorkflowStepFilterBuilder } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterBuilder';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

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

export const WorkflowEditActionFilter = ({
  action,
  actionOptions,
}: WorkflowEditActionFilterProps) => {
  const { t } = useLingui();
  const { input } = action.settings;

  const updateInput = (
    nextInput: WorkflowFilterAction['settings']['input'],
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: { ...action.settings, input: nextInput },
    });
  };

  const handleFilterSettingsUpdate = (filterSettings: FilterSettings) => {
    const nextFilter = {
      stepFilterGroups: filterSettings.stepFilterGroups ?? [],
      stepFilters: filterSettings.stepFilters ?? [],
    };

    updateInput({
      ...nextFilter,
      condition: computeWorkflowStepConditionFromFilter(nextFilter),
    });
  };

  // Rows can't hold a free expression, so editing one drops them
  const handleConditionChange = (condition: string) => {
    updateInput({ stepFilterGroups: [], stepFilters: [], condition });
  };

  return (
    <>
      <WorkflowStepBody>
        <WorkflowStepConditionInput
          instanceId={action.id}
          expressionLabel={t`Conditions`}
          condition={input.condition}
          conditionFromFilter={computeWorkflowStepConditionFromFilter(input)}
          hasFilterRows={
            isNonEmptyArray(input.stepFilters) ||
            isNonEmptyArray(input.stepFilterGroups)
          }
          readonly={actionOptions.readonly === true}
          onConditionSeed={(condition) => updateInput({ ...input, condition })}
          onConditionChange={handleConditionChange}
          filters={
            <WorkflowStepFilterBuilder
              instanceId={action.id}
              defaultValue={input}
              readonly={actionOptions.readonly}
              onFilterSettingsUpdate={handleFilterSettingsUpdate}
            />
          }
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
