import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { useTheme } from '@emotion/react';
import { BaseEdge } from '@xyflow/react';

type WorkflowRunDiagramBaseEdgeProps = Pick<
  WorkflowDiagramEdgeComponentProps,
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
