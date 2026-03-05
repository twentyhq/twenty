import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { BaseEdge } from '@xyflow/react';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

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
    ? resolveThemeVariable(themeCssVariables.color.blue)
    : isHovered
      ? resolveThemeVariable(themeCssVariables.font.color.light)
      : resolveThemeVariable(themeCssVariables.border.color.strong);

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
