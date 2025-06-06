import { EdgeLabelRenderer } from '@xyflow/react';
import { STEP_ICON_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import styled from '@emotion/styled';
import { IconButton } from 'twenty-ui/input';
import { IconPlus } from 'twenty-ui/display';
import { useTheme } from '@emotion/react';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';

const EDGE_OPTION_BUTTON_LEFT_MARGIN = 8;

const StyledEdgeOptionButton = styled(IconButton)`
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  pointer-events: all;
`;

const StyledContainer = styled.div<{
  labelX?: number;
  labelY?: number;
}>`
  position: absolute;
  transform: ${({ labelX, labelY }) =>
    `translate(${labelX}px, ${(labelY || 0) - STEP_ICON_WIDTH / 2}px) translateX(${EDGE_OPTION_BUTTON_LEFT_MARGIN}px)`};
`;

type WorkflowDiagramEdgeOptionsProps = {
  labelX: number;
  labelY: number;
  parentStepId: string;
  nextStepId: string;
};

export const WorkflowDiagramEdgeOptions = ({
  labelX,
  labelY,
  parentStepId,
  nextStepId,
}: WorkflowDiagramEdgeOptionsProps) => {
  const theme = useTheme();

  const { startNodeCreation } = useStartNodeCreation();

  return (
    <EdgeLabelRenderer>
      <StyledContainer labelX={labelX} labelY={labelY}>
        <StyledEdgeOptionButton
          className="nodrag nopan"
          Icon={IconPlus}
          size="small"
          ariaLabel="Insert a step"
          iconSize={theme.icon.size.sm}
          onClick={() => {
            startNodeCreation({ parentStepId, nextStepId });
          }}
        />
      </StyledContainer>
    </EdgeLabelRenderer>
  );
};
