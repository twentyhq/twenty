import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

type WorkflowDiagramSuccessEdgeProps = EdgeProps;

export const WorkflowDiagramSuccessEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  ...props
}: WorkflowDiagramSuccessEdgeProps) => {
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
        style={{ ...props.style, stroke: theme.tag.text.turquoise }}
      />
    </>
  );
};
