import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps } from '@xyflow/react';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useEdgeSelected } from '@/workflow/workflow-diagram/hooks/useEdgeSelected';

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

  const { isEdgeSelected } = useEdgeSelected();

  const selected = isEdgeSelected({ source, target });

  const stroke = selected ? theme.color.blue : theme.border.color.strong;

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
