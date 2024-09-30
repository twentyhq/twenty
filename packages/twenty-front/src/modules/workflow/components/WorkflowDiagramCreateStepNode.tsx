import { IconButton } from '@/ui/input/button/components/IconButton';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { IconPlus } from 'twenty-ui';

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

export const WorkflowDiagramCreateStepNode = () => {
  return (
    <>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} size="small" />
    </>
  );
};
