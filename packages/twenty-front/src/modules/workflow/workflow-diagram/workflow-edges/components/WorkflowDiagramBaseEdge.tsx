import { useTheme } from '@emotion/react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';

type WorkflowDiagramBaseEdgeProps = Pick<
  EdgeProps<WorkflowDiagramEdge>,
  'source' | 'target' | 'markerStart' | 'markerEnd'
> & {
  path: string;
};

export const WorkflowDiagramBaseEdge = ({
  source,
  target,
  markerStart,
  markerEnd,
  path,
}: WorkflowDiagramBaseEdgeProps) => {
  const theme = useTheme();

  const { isEdgeSelected, isEdgeHovered } = useEdgeState();

  const selected = isEdgeSelected({ source, target });

  const isHovered = isEdgeHovered({ source, target });

  const stroke = selected
    ? theme.color.blue
    : isHovered
      ? theme.font.color.light
      : theme.border.color.strong;

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
