import { WorkflowFilterAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowEditActionFilterBody } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilterBody';
import { WorkflowEditActionFilterBodyEffect } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilterBodyEffect';
import { StepFilterGroupsComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterGroupsComponentInstanceContext';
import { StepFiltersComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFiltersComponentInstanceContext';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import {
  StepFilter,
  StepFilterGroup,
} from 'twenty-shared/src/types/StepFilters';
import { useIcons } from 'twenty-ui/display';

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

export type FilterSettings = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
};

export const WorkflowEditActionFilter = ({
  action,
  actionOptions,
}: WorkflowEditActionFilterProps) => {
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'Filter',
    });

  const { getIcon } = useIcons();

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
    </>
  );
};
