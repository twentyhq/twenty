import {
  type ConnectionLineComponentProps,
  getBezierPath,
} from '@xyflow/react';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

type WorkflowDiagramConnectionProps = ConnectionLineComponentProps;

export const WorkflowDiagramConnection = ({
  fromX,
  fromY,
  toX,
  toY,
}: WorkflowDiagramConnectionProps) => {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY + 4,
    targetX: toX,
    targetY: toY - 4,
  });

  return (
    <path
      d={path}
      fill="none"
      stroke={resolveThemeVariable(themeCssVariables.color.blue)}
      markerEnd={`url(#${EDGE_BRANCH_ARROW_MARKER.Selected.markerEnd})`}
    />
  );
};
