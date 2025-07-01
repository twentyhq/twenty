import { WorkflowDiagramEdgeV1 } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV1';
import { WorkflowDiagramEdgeV2 } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from '@xyflow/react';
import { FeatureFlagKey } from '~/generated/graphql';

type WorkflowDiagramDefaultEdgeProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramDefaultEdge = ({
  source,
  target,
  sourceY,
  targetY,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramDefaultEdgeProps) => {
  const theme = useTheme();

  const isWorkflowFilteringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_FILTERING_ENABLED,
  );

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: CREATE_STEP_NODE_WIDTH,
    sourceY,
    targetX: CREATE_STEP_NODE_WIDTH,
    targetY,
  });

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.border.color.strong }}
      />
      {data?.shouldDisplayEdgeOptions && (
        <EdgeLabelRenderer>
          {isWorkflowFilteringEnabled ? (
            <WorkflowDiagramEdgeV2
              labelX={labelX}
              labelY={labelY}
              parentStepId={source}
              nextStepId={target}
            />
          ) : (
            <WorkflowDiagramEdgeV1
              labelY={labelY}
              parentStepId={source}
              nextStepId={target}
            />
          )}
        </EdgeLabelRenderer>
      )}
    </>
  );
};
