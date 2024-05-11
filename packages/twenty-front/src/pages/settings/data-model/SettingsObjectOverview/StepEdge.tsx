import { useCallback } from 'react';
import { Edge, getSmoothStepPath, useStore } from 'reactflow';
import { useTheme } from '@emotion/react';

import { getEdgeParams } from '~/pages/settings/data-model/SettingsObjectOverview/EdgeUtil';
type StepEdgeProps = Edge;

export const StepEdge = ({
  id,
  source,
  target,
  markerStart,
  markerEnd,
  style,
}: StepEdgeProps) => {
  const theme = useTheme();
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source]),
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target]),
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  );

  const [edgePath] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  /*
  const start = markerStart
    ?.toString()
    .replace('hasMany', 'hasMany-' + sourcePos);
  const end = markerEnd?.toString().replace('hasMany', 'hasMany-' + targetPos);
  */

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      stroke={theme.color.gray}
      markerStart={markerStart?.toString()}
      markerEnd={markerEnd?.toString()}
      style={style}
    />
  );
};
