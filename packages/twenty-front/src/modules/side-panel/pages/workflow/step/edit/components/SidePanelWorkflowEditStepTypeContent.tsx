import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import {
  SidePanelWorkflowSelectAction,
  type WorkflowActionSelection,
} from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import {
  type WorkflowAction,
  type WorkflowActionType,
} from '@/workflow/types/Workflow';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { getWorkflowAiAgentStepNameAfterKindChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentStepNameAfterKindChange';
import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { useIcons } from 'twenty-ui/icon';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';

export const SidePanelWorkflowEditStepTypeContent = () => {
  const { getIcon } = useIcons();
  const workflowSelectedNode = useAtomComponentStateValue(
    workflowSelectedNodeComponentState,
  );
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const flow = useFlowOrThrow();

  const existingStep = flow.steps?.find(
    (step) => step.id === workflowSelectedNode,
  );
  const existingAgentId =
    existingStep?.type === 'AI_AGENT'
      ? existingStep.settings.input.agentId
      : undefined;

  const { data: existingAgentData } = useQuery(FindOneAgentDocument, {
    variables: { id: existingAgentId ?? '' },
    skip: !isNonEmptyString(existingAgentId),
  });

  const { updateStepNow } = useUpdateStep();

  const { openWorkflowEditStepInSidePanel } = useSidePanelWorkflowNavigation();
  const { closeRightClickMenu } = useCloseRightClickMenu();
  const setSidePanelNavigationStack = useSetAtomState(
    sidePanelNavigationStackState,
  );

  const handleUpdateStepType = async (selection: WorkflowActionSelection) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error(
        doNotTranslate(
          'Workflow ID must be configured for the edge when creating a step',
        ),
      );
    }

    if (!isDefined(existingStep)) {
      throw new Error(doNotTranslate('Step not found'));
    }

    // the server renames a step only when its type changes, and both AI step kinds share the AI_AGENT type
    const nextDefaultAiAgentStepName =
      existingStep.type === 'AI_AGENT' && selection.type === 'AI_AGENT'
        ? selection.defaultName
        : undefined;

    const stepUpdate = {
      ...existingStep,
      name: isDefined(nextDefaultAiAgentStepName)
        ? getWorkflowAiAgentStepNameAfterKindChange({
            currentName: existingStep.name,
            previousAgentLabel: existingAgentData?.findOneAgent.label,
            nextDefaultName: nextDefaultAiAgentStepName,
          })
        : existingStep.name,
      type: selection.type,
      // a step kept on the same type is not rebuilt, so it keeps its error handling
      settings: isDefined(selection.defaultSettings)
        ? {
            ...existingStep.settings,
            outputSchema: {},
            ...selection.defaultSettings,
          }
        : existingStep.settings,
    };

    const { updatedStep } = await updateStepNow(stepUpdate as WorkflowAction);

    if (!isDefined(updatedStep)) {
      return;
    }

    closeRightClickMenu();

    setSidePanelNavigationStack([]);

    openWorkflowEditStepInSidePanel({
      workflowId: workflowVisualizerWorkflowId,
      title: getWorkflowStepDisplayName({
        name: updatedStep.name,
        type: updatedStep.type as WorkflowActionType,
      }),
      icon: getIcon(getActionIcon(updatedStep.type as WorkflowActionType)),
      stepId: updatedStep.id,
    });
  };

  return (
    <SidePanelWorkflowSelectAction onActionSelected={handleUpdateStepType} />
  );
};
