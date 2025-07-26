import { EDGE_GRAY_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGrayCircleMarkedId';
import { EDGE_GREEN_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenCircleMarkedId';
import { EDGE_GREEN_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerId';
import { EDGE_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeRoundedArrowMarkerId';
import { Theme, useTheme } from '@emotion/react';
import { BaseEdge } from '@xyflow/react';
import { StepStatus } from 'twenty-shared/workflow';

const toMarkerId = (id: string) => `url(#${id})`;

const getMarkerStart = (edgeExecutionStatus: StepStatus | undefined) => {
  if (edgeExecutionStatus === StepStatus.SUCCESS) {
    return EDGE_GREEN_CIRCLE_MARKED_ID;
  }

  return EDGE_GRAY_CIRCLE_MARKED_ID;
};

const getMarkerEnd = (edgeExecutionStatus: StepStatus | undefined) => {
  if (edgeExecutionStatus === StepStatus.SUCCESS) {
    return EDGE_GREEN_ROUNDED_ARROW_MARKER_ID;
  }

  return EDGE_ROUNDED_ARROW_MARKER_ID;
};

const getStrokeColor = ({
  theme,
  edgeExecutionStatus,
}: {
  theme: Theme;
  edgeExecutionStatus: StepStatus | undefined;
}) => {
  if (edgeExecutionStatus === StepStatus.SUCCESS) {
    return theme.tag.text.turquoise;
  }

  return theme.border.color.strong;
};

type WorkflowRunDiagramBaseEdgeProps = {
  edgePath: string;
  edgeExecutionStatus: StepStatus | undefined;
};

export const WorkflowRunDiagramBaseEdge = ({
  edgePath,
  edgeExecutionStatus,
}: WorkflowRunDiagramBaseEdgeProps) => {
  const theme = useTheme();

  return (
    <BaseEdge
      markerStart={toMarkerId(getMarkerStart(edgeExecutionStatus))}
      markerEnd={toMarkerId(getMarkerEnd(edgeExecutionStatus))}
      path={edgePath}
      style={{
        stroke: getStrokeColor({
          theme,
          edgeExecutionStatus,
        }),
      }}
    />
  );
};
