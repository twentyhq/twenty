import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import {
  WorkflowActionType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { useFilteredOtherActions } from '@/workflow/workflow-steps/workflow-actions/hooks/useFilteredOtherActions';
import { isDefined } from 'twenty-shared/utils';
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

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useRecoilComponentStateV2(workflowInsertStepIdsComponentState);

  const handleCreateStep = async (actionType: WorkflowActionType) => {
    const { parentStepId, nextStepId } = workflowInsertStepIds;

    if (!isDefined(parentStepId)) {
      throw new Error(
        'No parentStepId. Please select a parent step to create from.',
      );
    }

    await createStep({
      newStepType: actionType,
      parentStepId,
      nextStepId,
    });

    setWorkflowInsertStepIds({
      parentStepId: undefined,
      nextStepId: undefined,
    });
  };

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
          onClick={() => handleCreateStep(action.type)}
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
          onClick={() => handleCreateStep(action.type)}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
