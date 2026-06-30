import { type WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowStepFilterBuilder } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterBuilder';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  const handleFilterSettingsUpdate = (filterSettings: FilterSettings) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          stepFilterGroups: filterSettings.stepFilterGroups ?? [],
          stepFilters: filterSettings.stepFilters ?? [],
        },
      },
    });
  };

  return (
    <>
      <WorkflowStepBody rowGap={themeCssVariables.spacing[0]}>
        <WorkflowStepFilterBuilder
          instanceId={action.id}
          defaultValue={action.settings.input}
          readonly={actionOptions.readonly}
          onFilterSettingsUpdate={handleFilterSettingsUpdate}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
