import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionFilterBodyEffect } from '@/workflow/workflow-steps/filters/components/WorkflowEditActionFilterBodyEffect';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/filters/states/context/StepFiltersComponentInstanceContext';
import { WorkflowEditActionIfElseBody } from '@/workflow/workflow-steps/workflow-actions/if-else-action/components/WorkflowEditActionIfElseBody';

type WorkflowEditActionIfElseProps = {
  action: WorkflowIfElseAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowIfElseAction) => void;
      };
};

export const WorkflowEditActionIfElse = ({
  action,
  actionOptions,
}: WorkflowEditActionIfElseProps) => {
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
          <WorkflowEditActionIfElseBody
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
