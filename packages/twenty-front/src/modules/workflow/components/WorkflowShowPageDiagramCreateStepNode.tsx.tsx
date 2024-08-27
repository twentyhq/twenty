import { IconButton } from '@/ui/input/button/components/IconButton';
import { useStartNodeCreation } from '@/workflow/hooks/useStartNodeCreation';
import { WorkflowDiagramCreateStepNodeData } from '@/workflow/types/WorkflowDiagram';
import styled from '@emotion/styled';
import { Handle, Node, Position } from '@xyflow/react';
import { IconPlus } from 'twenty-ui';

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

type WorkflowShowPageDiagramCreateStepNodeProps =
  Node<WorkflowDiagramCreateStepNodeData>;

export const WorkflowShowPageDiagramCreateStepNode = ({
  data,
}: WorkflowShowPageDiagramCreateStepNodeProps) => {
  const { startNodeCreation } = useStartNodeCreation();

  return (
    <div>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton
        Icon={IconPlus}
        onClick={() => {
          startNodeCreation(data.parentNodeId);
        }}
      />
    </div>
  );
};
