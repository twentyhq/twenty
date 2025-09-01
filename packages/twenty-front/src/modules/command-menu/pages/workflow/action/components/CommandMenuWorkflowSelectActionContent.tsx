import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { WorkflowActionMenuItems } from '@/command-menu/pages/workflow/action/components/WorkflowActionMenuItems';
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
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { OTHER_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/OtherActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';

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

  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const isIteratorEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_ITERATOR_ENABLED,
  );

  const { t } = useLingui();

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        {t`Data`}
      </RightDrawerWorkflowSelectStepTitle>
      {WorkflowActionMenuItems(RECORD_ACTIONS, theme, handleCreateStep)}
      {isAiEnabled && (
        <>
          <RightDrawerWorkflowSelectStepTitle>
            {t`AI`}
          </RightDrawerWorkflowSelectStepTitle>
          {WorkflowActionMenuItems(AI_ACTIONS, theme, handleCreateStep)}
        </>
      )}
      <RightDrawerWorkflowSelectStepTitle>
        {t`Core`}
      </RightDrawerWorkflowSelectStepTitle>
      {WorkflowActionMenuItems(CORE_ACTIONS, theme, handleCreateStep)}
      <RightDrawerWorkflowSelectStepTitle>
        {t`Human Input`}
      </RightDrawerWorkflowSelectStepTitle>
      {WorkflowActionMenuItems(HUMAN_INPUT_ACTIONS, theme, handleCreateStep)}
      {isIteratorEnabled && (
        <>
          <RightDrawerWorkflowSelectStepTitle>
            {t`Others`}
          </RightDrawerWorkflowSelectStepTitle>
          {WorkflowActionMenuItems(OTHER_ACTIONS, theme, handleCreateStep)}
        </>
      )}
    </RightDrawerStepListContainer>
  );
};
