import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { IconButton, IconPlus } from 'twenty-ui';

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

export const WorkflowDiagramCreateStepNode = () => {
  return (
    <>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} size="medium" />
    </>
  );
};
