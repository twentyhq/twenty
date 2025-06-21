import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { useFilteredOtherActions } from '@/workflow/workflow-steps/workflow-actions/hooks/useFilteredOtherActions';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

export const CommandMenuWorkflowSelectActionContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getIcon } = useIcons();
  const { createStep } = useCreateStep({
    workflow,
  });
  const filteredOtherActions = useFilteredOtherActions();

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        Records
      </RightDrawerWorkflowSelectStepTitle>
      {RECORD_ACTIONS.map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => createStep(action.type)}
        />
      ))}
      <RightDrawerWorkflowSelectStepTitle>
        Other
      </RightDrawerWorkflowSelectStepTitle>
      {filteredOtherActions.map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => createStep(action.type)}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
