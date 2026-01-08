import { type WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionFilterBodyEffect } from '@/workflow/workflow-steps/filters/components/WorkflowEditActionFilterBodyEffect';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { WorkflowEditActionFilterBody } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilterBody';

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
  return (
    <>
      <StepFiltersComponentInstanceContext.Provider
        value={{
          instanceId: action.id,
        }}
      >
        <StepFilterGroupsComponentInstanceContext.Provider
          value={{
            instanceId: action.id,
          }}
        >
          <WorkflowEditActionFilterBody
            action={action}
            actionOptions={actionOptions}
          />
          <WorkflowEditActionFilterBodyEffect
            stepId={action.id}
            defaultValue={{
              stepFilterGroups: action.settings.input.stepFilterGroups,
              stepFilters: action.settings.input.stepFilters,
            }}
          />
        </StepFilterGroupsComponentInstanceContext.Provider>
      </StepFiltersComponentInstanceContext.Provider>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
