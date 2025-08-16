import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import {
  type WorkflowActionType,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AIActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useTheme } from '@emotion/react';

export const CommandMenuWorkflowSelectActionContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getIcon } = useIcons();

  const { createStep } = useCreateStep({
    workflow,
  });

  const { closeRightClickMenu } = useCloseRightClickMenu();

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useRecoilComponentState(workflowInsertStepIdsComponentState);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const handleCreateStep = async (actionType: WorkflowActionType) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error(
        'Workflow ID must be configured for the edge when creating a step',
      );
    }

    const { parentStepId, nextStepId, position } = workflowInsertStepIds;

    const createdStep = await createStep({
      newStepType: actionType,
      parentStepId,
      nextStepId,
      position,
    });

    if (!isDefined(createdStep)) {
      return;
    }

    setWorkflowInsertStepIds({
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
    });

    closeRightClickMenu();

    setCommandMenuNavigationStack([]);

    openWorkflowEditStepInCommandMenu(
      workflowVisualizerWorkflowId,
      createdStep.name,
      getIcon(getActionIcon(createdStep.type as WorkflowActionType)),
    );
  };

  const theme = useTheme();

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        Data
      </RightDrawerWorkflowSelectStepTitle>
      {RECORD_ACTIONS.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItemCommand
            key={action.type}
            LeftIcon={(props) => (
              <Icon
                {...props}
                color={getActionIconColorOrThrow({ theme, actionType: action.type })}
              />
            )}
            text={action.label}
            onClick={() => handleCreateStep(action.type)}
          />
        );
      })}
      <RightDrawerWorkflowSelectStepTitle>
        AI
      </RightDrawerWorkflowSelectStepTitle>
      {AI_ACTIONS.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItemCommand
            key={action.type}
            LeftIcon={(props) => (
              <Icon
                {...props}
                color={getActionIconColorOrThrow({ theme, actionType: action.type })}
              />
            )}
            text={action.label}
            onClick={() => handleCreateStep(action.type)}
          />
        );
      })}
      <RightDrawerWorkflowSelectStepTitle>
        Core
      </RightDrawerWorkflowSelectStepTitle>
      {CORE_ACTIONS.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItemCommand
            key={action.type}
            LeftIcon={(props) => (
              <Icon
                {...props}
                color={getActionIconColorOrThrow({ theme, actionType: action.type })}
              />
            )}
            text={action.label}
            onClick={() => handleCreateStep(action.type)}
          />
        );
      })}
      <RightDrawerWorkflowSelectStepTitle>
        Human Input
      </RightDrawerWorkflowSelectStepTitle>
      {HUMAN_INPUT_ACTIONS.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItemCommand
            key={action.type}
            LeftIcon={(props) => (
              <Icon
                {...props}
                color={getActionIconColorOrThrow({ theme, actionType: action.type })}
              />
            )}
            text={action.label}
            onClick={() => handleCreateStep(action.type)}
          />
        );
      })}
    </RightDrawerStepListContainer>
  );
};
