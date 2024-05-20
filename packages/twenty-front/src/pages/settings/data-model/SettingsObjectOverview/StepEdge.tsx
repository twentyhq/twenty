import { useCallback } from 'react';
import {
  Edge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useStore,
} from 'reactflow';
import { useTheme } from '@emotion/react';

import { Button } from '@/ui/input/button/components/Button';
import { getEdgeParams } from '~/pages/settings/data-model/SettingsObjectOverview/EdgeUtil';
type StepEdgeProps = Edge;

export const StepEdge = ({
  id,
  source,
  target,
  markerStart,
  markerEnd,
  style,
  data,
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

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={theme.color.gray}
        markerStart={markerStart?.toString()}
        markerEnd={markerEnd?.toString()}
        style={style}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <Button
            size="small"
            title={
              data.relations.length +
              ' Relation' +
              (data.relations.length > 1 ? 's' : '')
            }
          ></Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
