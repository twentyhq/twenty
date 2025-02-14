import { StyledHandle } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { NODE_BORDER_WIDTH } from '@/workflow/workflow-diagram/constants/NodeBorderWidth';
import { NODE_ICON_LEFT_MARGIN } from '@/workflow/workflow-diagram/constants/NodeIconLeftMargin';
import { NODE_ICON_WIDTH } from '@/workflow/workflow-diagram/constants/NodeIconWidth';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { IconButton, IconPlus } from 'twenty-ui';

const StyledContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(3)};
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
