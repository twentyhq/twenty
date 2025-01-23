import {
  NODE_BORDER_WIDTH,
  NODE_ICON_LEFT_MARGIN,
  NODE_ICON_WIDTH,
  StyledHandle,
} from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseStepNode';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { IconButton, IconPlus } from 'twenty-ui';

const StyledContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  transform: translateX(-50%);
  position: relative;
  left: ${NODE_ICON_WIDTH + NODE_ICON_LEFT_MARGIN + NODE_BORDER_WIDTH}px;
`;

const StyledTargetHandle = styled(StyledHandle)`
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
