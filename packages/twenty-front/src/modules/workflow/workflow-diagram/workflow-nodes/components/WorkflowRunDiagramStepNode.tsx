import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowRunDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowDiagramHandleSource } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleSource';
import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeIcon';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { getNodeIterationCount } from '@/workflow/workflow-diagram/workflow-nodes/utils/getNodeIterationCount';
import { styled } from '@linaria/react';
import { Position } from '@xyflow/react';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { IconCheck, IconX, useIcons } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNodeLabelWithCounterPart = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  height: 14px;
  justify-content: space-between;
  box-sizing: border-box;
  column-gap: ${themeCssVariables.spacing[2]};
`;

const StyledStatusIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  box-sizing: border-box;
`;

const StyledColorIcon = styled.div<{
  color: string;
}>`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
  background: ${({ color }) => color};
`;

const StyledIterationCounter = styled.div<{
  runStatus?: WorkflowRunStepStatus;
}>`
  color: ${({ runStatus }) =>
    getWorkflowDiagramColors({ runStatus }).unselected.color};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledRightPartContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkflowRunDiagramStepNode = ({
  id,
  data,
}: {
  id: string;
  data: WorkflowRunDiagramStepNodeData;
}) => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowRunId = useWorkflowRunIdOrThrow();

  const [workflowSelectedNode, setWorkflowSelectedNode] = useAtomComponentState(
    workflowSelectedNodeComponentState,
  );

  const selected = workflowSelectedNode === id;

  const { openWorkflowRunViewStepInSidePanel } =
    useSidePanelWorkflowNavigation();

  const { isInSidePanel } = useContext(ActionMenuContext);

  const setSidePanelNavigationStack = useSetAtomState(
    sidePanelNavigationStackState,
  );

  const workflowRun = useWorkflowRun({ workflowRunId });

  const stepInfo = workflowRun?.state?.stepInfos[data.stepId];

  const iterationCount =
    data.nodeType === 'action' && isDefined(stepInfo)
      ? getNodeIterationCount({ stepInfo })
      : 0;

  const handleClick = () => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error('Workflow ID must be defined');
    }

    if (!isInSidePanel) {
      setSidePanelNavigationStack([]);
    }

    setWorkflowSelectedNode(id);

    openWorkflowRunViewStepInSidePanel({
      workflowId: workflowVisualizerWorkflowId,
      workflowRunId,
      title: data.name,
      icon: getIcon(getWorkflowNodeIconKey(data)),
      workflowSelectedNode: id,
      stepExecutionStatus: data.runStatus,
    });
  };

  return (
    <>
      <WorkflowNodeContainer
        data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
        runStatus={data.runStatus}
        onClick={handleClick}
        selected={selected}
      >
        <WorkflowDiagramHandleTarget />
        <WorkflowNodeIconContainer>
          <WorkflowDiagramStepNodeIcon data={data} />
        </WorkflowNodeIconContainer>

        <WorkflowNodeRightPart>
          <StyledNodeLabelWithCounterPart>
            <WorkflowNodeLabel runStatus={data.runStatus} selected={selected}>
              {capitalize(data.nodeType)}
            </WorkflowNodeLabel>

            <StyledRightPartContainer>
              {iterationCount > 0 && (
                <StyledIterationCounter runStatus={data.runStatus}>
                  {iterationCount}
                </StyledIterationCounter>
              )}

              {(data.runStatus === StepStatus.SUCCESS ||
                data.runStatus === StepStatus.STOPPED) && (
                <StyledStatusIconsContainer>
                  <StyledColorIcon
                    color={themeCssVariables.tag.background.turquoise}
                  >
                    <IconCheck
                      color={themeCssVariables.tag.text.turquoise}
                      size={14}
                    />
                  </StyledColorIcon>
                </StyledStatusIconsContainer>
              )}

              {(data.runStatus === StepStatus.FAILED ||
                data.runStatus === StepStatus.FAILED_SAFELY) && (
                <StyledStatusIconsContainer>
                  <StyledColorIcon color={themeCssVariables.tag.background.red}>
                    <IconX color={themeCssVariables.tag.text.red} size={14} />
                  </StyledColorIcon>
                </StyledStatusIconsContainer>
              )}

              {(data.runStatus === StepStatus.RUNNING ||
                data.runStatus === StepStatus.PENDING) && (
                <StyledStatusIconsContainer>
                  <Loader color="yellow" />
                </StyledStatusIconsContainer>
              )}
            </StyledRightPartContainer>
          </StyledNodeLabelWithCounterPart>

          <WorkflowNodeTitle runStatus={data.runStatus} selected={selected}>
            {data.name}
          </WorkflowNodeTitle>
        </WorkflowNodeRightPart>
      </WorkflowNodeContainer>

      <WorkflowDiagramHandleSource
        id={WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID}
        type="source"
        position={Position.Bottom}
        disableHoverEffect
        selected={selected}
        runStatus={data.runStatus}
      />

      {isDefined(data.rightHandleOptions) && (
        <WorkflowDiagramHandleSource
          id={data.rightHandleOptions.id}
          type="source"
          position={Position.Right}
          disableHoverEffect
          selected={selected}
          runStatus={data.runStatus}
        />
      )}
    </>
  );
};
