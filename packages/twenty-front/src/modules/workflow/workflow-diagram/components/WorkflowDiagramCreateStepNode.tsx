import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { IconButton, IconPlus } from 'twenty-ui';

const StyledContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  position: relative;
`;

export const StyledTargetHandle = styled(Handle)`
  left: ${({ theme }) => theme.spacing(10)};
  visibility: hidden;
`;

export const WorkflowDiagramCreateStepNode = () => {
  return (
    <StyledContainer>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} size="medium" ariaLabel="Add a step" />
    </StyledContainer>
  );
};
