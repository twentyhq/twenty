import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { useStartIteratorFirstNodeCreation } from '@/workflow/workflow-diagram/workflow-iterator/hooks/useStartIteratorFirstNodeCreation';
import { type WorkflowDiagramIteratorEmptyActionNodeData } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowDiagramIteratorEmptyActionNodeData';
import { WorkflowDiagramHandleSource } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleSource';
import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { useConnectionState } from '@/workflow/workflow-diagram/workflow-nodes/hooks/useConnectionState';
import { useLingui } from '@lingui/react/macro';
import { Position } from '@xyflow/react';
import { useState } from 'react';

export const WorkflowDiagramIteratorEmptyActionEditable = ({
  id,
  selected,
}: {
  id: string;
  selected: boolean;
  data: WorkflowDiagramIteratorEmptyActionNodeData;
}) => {
  const { t } = useLingui();

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const { isConnectable, isSourceConnected } = useConnectionState('action');

  const { isSourceSelected, isSourceHovered } = useEdgeState();

  const { startIteratorFirstNodeCreation } =
    useStartIteratorFirstNodeCreation();

  const handleClick = () => {
    startIteratorFirstNodeCreation();
  };

  return (
    <WorkflowNodeContainer
      data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <WorkflowDiagramHandleTarget isConnectable={false} />

      <WorkflowNodeIconContainer />

      <WorkflowNodeRightPart>
        <WorkflowNodeLabelWithCounterPart>
          <WorkflowNodeLabel>{t`Action`}</WorkflowNodeLabel>
        </WorkflowNodeLabelWithCounterPart>

        <WorkflowNodeTitle>{t`Add an Action`}</WorkflowNodeTitle>
      </WorkflowNodeRightPart>

      <WorkflowDiagramHandleSource
        id={WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID}
        type="source"
        position={Position.Bottom}
        disableHoverEffect
        selected={
          isSourceSelected({
            nodeId: id,
            sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
          }) ||
          selected ||
          isSourceConnected(id) ||
          (isConnectable(id) && isHovered)
        }
        hovered={
          isSourceHovered({
            nodeId: id,
            sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
          }) || isHovered
        }
      />
    </WorkflowNodeContainer>
  );
};
