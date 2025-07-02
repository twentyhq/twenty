import {
  WorkflowRunOutputStepsOutput,
  WorkflowStep,
  WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { WORKFLOW_VISUALIZER_EDGE_SUCCESS_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeSuccessConfiguration';
import {
  WorkflowDiagramRunStatus,
  WorkflowRunDiagram,
  WorkflowRunDiagramNode,
  WorkflowRunDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { isStepNode } from '@/workflow/workflow-diagram/utils/isStepNode';

export const generateWorkflowRunDiagram = ({
  trigger,
  steps,
  stepsOutput,
}: {
  trigger: WorkflowTrigger;
  steps: Array<WorkflowStep>;
  stepsOutput: WorkflowRunOutputStepsOutput | undefined;
}): {
  diagram: WorkflowRunDiagram;
  stepToOpenByDefault:
    | {
        id: string;
        data: WorkflowRunDiagramStepNodeData;
      }
    | undefined;
} => {
  let stepToOpenByDefault:
    | {
        id: string;
        data: WorkflowRunDiagramStepNodeData;
      }
    | undefined = undefined;

  const workflowDiagram = generateWorkflowDiagram({ trigger, steps });

  let skippedExecution = false;

  const workflowRunDiagramNodes: WorkflowRunDiagramNode[] =
    workflowDiagram.nodes.filter(isStepNode).map((node) => {
      if (node.data.nodeType === 'trigger') {
        return {
          ...node,
          data: {
            ...node.data,
            runStatus: 'success',
          },
        };
      }

      const nodeId = node.id;

      const runResult = stepsOutput?.[nodeId];

      const isPendingFormAction =
        node.data.nodeType === 'action' &&
        node.data.actionType === 'FORM' &&
        isDefined(runResult?.pendingEvent) &&
        runResult.pendingEvent;

      let runStatus: WorkflowDiagramRunStatus = 'success';

      if (skippedExecution) {
        runStatus = 'not-executed';
      } else if (!isDefined(runResult) || isPendingFormAction) {
        runStatus = 'running';
      } else if (isDefined(runResult.error)) {
        runStatus = 'failure';
      }

      skippedExecution =
        skippedExecution || runStatus === 'failure' || runStatus === 'running';

      const nodeData = { ...node.data, runStatus };

      if (isPendingFormAction) {
        stepToOpenByDefault = {
          id: nodeId,
          data: nodeData,
        };
      }

      return {
        ...node,
        data: nodeData,
      };
    });

  const workflowRunDiagramEdges = workflowDiagram.edges.map((edge) => {
    const parentNode = workflowRunDiagramNodes.find(
      (node) => node.id === edge.source,
    );

    if (isDefined(parentNode) && parentNode.data.runStatus === 'success') {
      return {
        ...edge,
        ...WORKFLOW_VISUALIZER_EDGE_SUCCESS_CONFIGURATION,
      };
    }

    return edge;
  });

  return {
    diagram: {
      nodes: workflowRunDiagramNodes,
      edges: workflowRunDiagramEdges,
    },
    stepToOpenByDefault,
  };
};
