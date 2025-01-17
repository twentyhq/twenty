import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { IconButton, IconPlus } from 'twenty-ui';

const StyledContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

export const WorkflowDiagramCreateStepNode = () => {
  return (
    <StyledContainer>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} size="medium" />
    </StyledContainer>
  );
};
