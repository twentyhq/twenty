import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { OTHER_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/OtherActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { MenuItemCommand, useIcons } from 'twenty-ui';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';

export const RightDrawerWorkflowSelectActionContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getIcon } = useIcons();
  const { createStep } = useCreateStep({
    workflow,
  });

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
      {OTHER_ACTIONS.map((action) => (
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
