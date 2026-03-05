import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowDiagramEmptyTriggerEditable = ({ id }: { id: string }) => {
  const { t } = useLingui();

  const { openWorkflowTriggerTypeInSidePanel } =
    useSidePanelWorkflowNavigation();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const [workflowSelectedNode, setWorkflowSelectedNode] = useAtomComponentState(
    workflowSelectedNodeComponentState,
  );

  const { isInSidePanel } = useContext(ActionMenuContext);

  const setSidePanelNavigationStack = useSetAtomState(
    sidePanelNavigationStackState,
  );

  const selected = workflowSelectedNode === id;

  const { resetWorkflowInsertStepIds } = useResetWorkflowInsertStepIds();

  const handleClick = () => {
    if (!isInSidePanel) {
      setSidePanelNavigationStack([]);
    }

    resetWorkflowInsertStepIds();

    setWorkflowSelectedNode(id);

    if (!isDefined(workflowVisualizerWorkflowId)) {
      return;
    }

    openWorkflowTriggerTypeInSidePanel(workflowVisualizerWorkflowId);
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
