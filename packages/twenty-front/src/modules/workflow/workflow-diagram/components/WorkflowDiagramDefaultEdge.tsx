import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeProps = EdgeProps;

export const WorkflowDiagramDefaultEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  ...props
}: WorkflowDiagramDefaultEdgeProps) => {
  const theme = useTheme();

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        path={edgePath}
        style={{ ...props.style, stroke: theme.border.color.strong }}
      />
    </>
  );
};
