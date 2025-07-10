import {
  WorkflowRunStateStepsInfos,
  WorkflowStep,
  WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { WORKFLOW_VISUALIZER_EDGE_SUCCESS_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeSuccessConfiguration';
import {
  WorkflowRunDiagram,
  WorkflowRunDiagramNode,
  WorkflowRunDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { isStepNode } from '@/workflow/workflow-diagram/utils/isStepNode';
import { transformFilterNodesAsEdges } from '@/workflow/workflow-diagram/utils/transformFilterNodesAsEdges';
import { isDefined } from 'twenty-shared/utils';

export const generateWorkflowRunDiagram = ({
  trigger,
  steps,
  stepsInfo,
}: {
  trigger: WorkflowTrigger;
  steps: Array<WorkflowStep>;
  stepsInfo: WorkflowRunStateStepsInfos | undefined;
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

  const workflowDiagram = transformFilterNodesAsEdges(
    generateWorkflowDiagram({ trigger, steps }),
  );

  const workflowRunDiagramNodes: WorkflowRunDiagramNode[] =
    workflowDiagram.nodes.filter(isStepNode).map((node) => {
      const nodeId = node.id;

      const stepInfos = stepsInfo?.[nodeId];

      if (!isDefined(stepInfos)) {
        return {
          ...node,
          data: {
            ...node.data,
            runStatus: 'NOT_STARTED',
          },
        };
      }

      const nodeData = {
        ...node.data,
        runStatus: stepInfos.status,
      };

      if (!isDefined(stepToOpenByDefault) && stepInfos.status === 'PENDING') {
        stepToOpenByDefault = { id: nodeId, data: nodeData };
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

    if (!isDefined(parentNode)) {
      return edge;
    }

    const stepInfos = stepsInfo?.[parentNode.id];

    if (!isDefined(stepInfos)) {
      return edge;
    }

    if (stepInfos.status === 'SUCCESS') {
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
