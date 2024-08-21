import { IconButton } from '@/ui/input/button/components/IconButton';
import { useStartNodeCreation } from '@/workflow/hooks/useStartNodeCreation';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { IconPlus } from 'twenty-ui';

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

export const WorkflowShowPageDiagramCreateStepNode = () => {
  const { startNodeCreation } = useStartNodeCreation();

  return (
    <div>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} onClick={startNodeCreation} />
    </div>
  );
};
