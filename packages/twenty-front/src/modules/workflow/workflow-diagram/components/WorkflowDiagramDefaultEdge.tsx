import { useTheme } from '@emotion/react';
import {
  BaseEdge,
  EdgeProps,
  getStraightPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import {
  CREATE_STEP_NODE_WIDTH,
  STEP_ICON_WIDTH,
} from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import styled from '@emotion/styled';
import { IconButton } from 'twenty-ui/input';
import { IconPlus } from 'twenty-ui/display';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';

const EDGE_OPTION_BUTTON_LEFT_MARGIN = 8;

type WorkflowDiagramDefaultEdgeProps = EdgeProps;

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

export const WorkflowDiagramDefaultEdge = ({
  source,
  target,
  sourceY,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeProps) => {
  const theme = useTheme();

  const { startNodeCreation } = useStartNodeCreation();

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: CREATE_STEP_NODE_WIDTH,
    sourceY,
    targetX: CREATE_STEP_NODE_WIDTH,
    targetY,
  });

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.border.color.strong }}
      />
      <EdgeLabelRenderer>
        <StyledContainer labelX={labelX} labelY={labelY}>
          <StyledEdgeOptionButton
            className="nodrag nopan"
            Icon={IconPlus}
            size="small"
            ariaLabel="Insert a step"
            iconSize={theme.icon.size.sm}
            onClick={() => {
              startNodeCreation({ parentStepId: source, nextStepId: target });
            }}
          />
        </StyledContainer>
      </EdgeLabelRenderer>
    </>
  );
};
