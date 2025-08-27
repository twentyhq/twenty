import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useTheme } from '@emotion/react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';

type WorkflowRunDiagramBaseEdgeProps = Pick<
  EdgeProps<WorkflowDiagramEdge>,
  'markerStart' | 'markerEnd'
> & {
  path: string;
};

export const WorkflowRunDiagramBaseEdge = ({
  path,
  markerStart,
  markerEnd,
}: WorkflowRunDiagramBaseEdgeProps) => {
  const theme = useTheme();

  return (
    <BaseEdge
      markerStart={markerStart}
      markerEnd={markerEnd}
      path={path}
      style={{ stroke: theme.border.color.strong }}
    />
  );
};
