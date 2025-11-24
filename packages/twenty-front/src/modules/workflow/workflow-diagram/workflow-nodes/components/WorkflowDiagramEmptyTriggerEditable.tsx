import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { useResetWorkflowInsertStepIds } from '@/workflow/workflow-diagram/hooks/useResetWorkflowInsertStepIds';
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

export const WorkflowDiagramEmptyTriggerEditable = ({ id }: { id: string }) => {
  const { t } = useLingui();

  const { openWorkflowTriggerTypeInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const [workflowSelectedNode, setWorkflowSelectedNode] =
    useRecoilComponentState(workflowSelectedNodeComponentState);

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const selected = workflowSelectedNode === id;

  const { resetWorkflowInsertStepIds } = useResetWorkflowInsertStepIds();

  const handleClick = () => {
    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    resetWorkflowInsertStepIds();

    setWorkflowSelectedNode(id);

    if (!isDefined(workflowVisualizerWorkflowId)) {
      return;
    }

    openWorkflowTriggerTypeInCommandMenu(workflowVisualizerWorkflowId);
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
