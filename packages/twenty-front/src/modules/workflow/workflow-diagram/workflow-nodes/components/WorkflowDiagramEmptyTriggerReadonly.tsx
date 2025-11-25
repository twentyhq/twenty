import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';

export const WorkflowDiagramEmptyTriggerReadonly = ({ id }: { id: string }) => {
  const { getIcon } = useIcons();
  const { t } = useLingui();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowVisualizerWorkflowVersionId = useRecoilComponentValue(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const [workflowSelectedNode, setWorkflowSelectedNode] =
    useRecoilComponentState(workflowSelectedNodeComponentState);

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { openWorkflowViewStepInCommandMenu } = useWorkflowCommandMenu();

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const selected = workflowSelectedNode === id;

  const handleClick = () => {
    if (
      !isDefined(workflowVisualizerWorkflowId) ||
      !isDefined(workflowVisualizerWorkflowVersionId)
    ) {
      throw new Error(
        'Workflow ID and Version ID must be defined to open the command menu.',
      );
    }

    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    setWorkflowSelectedNode(TRIGGER_STEP_ID);

    openWorkflowViewStepInCommandMenu({
      workflowId: workflowVisualizerWorkflowId,
      workflowVersionId: workflowVisualizerWorkflowVersionId,
      title: t`Add a Trigger`,
      icon: getIcon(null),
      stepId: TRIGGER_STEP_ID,
    });
  };

  return (
    <WorkflowNodeContainer
      data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
      onClick={handleClick}
      selected={selected}
    >
      <WorkflowNodeIconContainer />

      <WorkflowNodeRightPart>
        <WorkflowNodeLabelWithCounterPart>
          <WorkflowNodeLabel selected={selected}>
            {t`Trigger`}
          </WorkflowNodeLabel>
        </WorkflowNodeLabelWithCounterPart>

        <WorkflowNodeTitle selected={selected}>
          {t`Add a Trigger`}
        </WorkflowNodeTitle>
      </WorkflowNodeRightPart>
    </WorkflowNodeContainer>
  );
};
