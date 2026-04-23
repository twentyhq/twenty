import {
  type ConnectionLineComponentProps,
  getBezierPath,
} from '@xyflow/react';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';

type WorkflowDiagramConnectionProps = ConnectionLineComponentProps;

export const WorkflowDiagramConnection = ({
  fromX,
  fromY,
  toX,
  toY,
}: WorkflowDiagramConnectionProps) => {
  const { theme } = useContext(ThemeContext);
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
      stroke={theme.color.blue}
      markerEnd={`url(#${EDGE_BRANCH_ARROW_MARKER.Selected.markerEnd})`}
    />
  );
};
