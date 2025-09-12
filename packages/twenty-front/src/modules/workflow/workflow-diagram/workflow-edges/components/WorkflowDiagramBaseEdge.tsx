import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { useTheme } from '@emotion/react';
import { BaseEdge } from '@xyflow/react';

type WorkflowDiagramBaseEdgeProps = Pick<
  WorkflowDiagramEdgeComponentProps,
  | 'source'
  | 'sourceHandleId'
  | 'target'
  | 'targetHandleId'
  | 'markerStart'
  | 'markerEnd'
> & {
  path: string;
};

export const WorkflowDiagramBaseEdge = ({
  source,
  target,
  sourceHandleId,
  targetHandleId,
  markerStart,
  markerEnd,
  path,
}: WorkflowDiagramBaseEdgeProps) => {
  const theme = useTheme();

  const { isEdgeSelected, isEdgeHovered } = useEdgeState();

  const selected = isEdgeSelected({
    source,
    target,
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
  });

  const isHovered = isEdgeHovered({
    source,
    target,
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
  });

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
