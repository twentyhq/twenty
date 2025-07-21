import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { WorkflowDiagramEdgeV2EmptyContent } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2EmptyContent';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { useTheme } from '@emotion/react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from '@xyflow/react';

type WorkflowDiagramDefaultEdgeEditableProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramDefaultEdgeEditable = ({
  source,
  target,
  sourceY,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeEditableProps) => {
  const theme = useTheme();

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: CREATE_STEP_NODE_WIDTH,
    sourceY,
    targetX: CREATE_STEP_NODE_WIDTH,
    targetY,
  });

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  assertWorkflowWithCurrentVersionIsDefined(workflow);

  const { createStep } = useCreateStep({ workflow });
  const { startNodeCreation } = useStartNodeCreation();

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.border.color.strong }}
      />

      <EdgeLabelRenderer>
        <WorkflowDiagramEdgeV2EmptyContent
          labelX={labelX}
          labelY={labelY}
          parentStepId={source}
          nextStepId={target}
          onCreateFilter={() => {
            return createStep({
              newStepType: 'FILTER',
              parentStepId: source,
              nextStepId: target,
            });
          }}
          onCreateNode={() => {
            startNodeCreation({
              parentStepId: source,
              nextStepId: target,
            });
          }}
        />
      </EdgeLabelRenderer>
    </>
  );
};
