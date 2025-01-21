import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { IconButton, IconPlus } from 'twenty-ui';

const StyledContainer = styled.div`
  padding-left: 24px;
  padding-top: ${({ theme }) => theme.spacing(1)};
  position: relative;
`;

export const StyledTargetHandle = styled(Handle)`
  left: 40px;
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
