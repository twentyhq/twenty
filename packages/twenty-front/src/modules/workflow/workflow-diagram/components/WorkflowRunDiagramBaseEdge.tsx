import { EDGE_GREEN_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenCircleMarkedId';
import { EDGE_GREEN_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerId';
import { EDGE_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeRoundedArrowMarkerId';
import { type Theme, useTheme } from '@emotion/react';
import { BaseEdge } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

const toMarkerId = (id: string) => `url(#${id})`;

const getMarkerStart = (edgeExecutionStatus: StepStatus | undefined) => {
  if (edgeExecutionStatus === StepStatus.SUCCESS) {
    return EDGE_GREEN_CIRCLE_MARKED_ID;
  }

  return undefined;
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

  const markerStart = getMarkerStart(edgeExecutionStatus);

  return (
    <BaseEdge
      markerStart={isDefined(markerStart) ? toMarkerId(markerStart) : undefined}
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
