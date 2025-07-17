import { WorkflowDiagramEdgeV1 } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV1';
import { WorkflowDiagramEdgeV2Empty } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Empty';
import { WorkflowDiagramEdgeV2Filter } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Filter';
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
import { isDefined } from 'twenty-shared/utils';
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

  if (!isDefined(data)) {
    throw new Error('Edge data is not defined');
  }

  const displayEdgeV1 = !isWorkflowFilteringEnabled && data.isEdgeEditable;
  const displayEmptyFilters =
    isWorkflowFilteringEnabled &&
    data.edgeType === 'default' &&
    data.isEdgeEditable;
  const displayFilters =
    isWorkflowFilteringEnabled && data.edgeType === 'filter';

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.border.color.strong }}
      />

      <EdgeLabelRenderer>
        {displayEdgeV1 && (
          <WorkflowDiagramEdgeV1
            labelY={labelY}
            parentStepId={source}
            nextStepId={target}
          />
        )}
        {displayEmptyFilters && (
          <WorkflowDiagramEdgeV2Empty
            labelX={labelX}
            labelY={labelY}
            parentStepId={source}
            nextStepId={target}
          />
        )}
        {displayFilters && (
          <WorkflowDiagramEdgeV2Filter
            labelX={labelX}
            labelY={labelY}
            stepId={data.stepId}
            parentStepId={source}
            nextStepId={target}
            filterSettings={data.filterSettings}
            isEdgeEditable={data.isEdgeEditable}
          />
        )}
      </EdgeLabelRenderer>
    </>
  );
};
