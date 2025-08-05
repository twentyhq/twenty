import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps } from '@xyflow/react';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

type WorkflowDiagramBaseEdgeProps = Partial<EdgeProps<WorkflowDiagramEdge>> & {
  path: string;
};

export const WorkflowDiagramBaseEdge = ({
  selected,
  markerStart,
  markerEnd,
  path,
}: WorkflowDiagramBaseEdgeProps) => {
  const theme = useTheme();

  const stroke = selected ? theme.border.color.blue : theme.border.color.strong;

  return (
    <BaseEdge
      markerStart={markerStart}
      markerEnd={markerEnd}
      path={path}
      style={{
        stroke,
      }}
    />
  );
};
