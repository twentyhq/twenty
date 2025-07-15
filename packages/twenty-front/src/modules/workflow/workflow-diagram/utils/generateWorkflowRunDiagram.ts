import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
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
import { WorkflowRunStepInfos, StepStatus } from 'twenty-shared/workflow';

export const generateWorkflowRunDiagram = ({
  trigger,
  steps,
  stepInfos,
}: {
  trigger: WorkflowTrigger;
  steps: Array<WorkflowStep>;
  stepInfos: WorkflowRunStepInfos | undefined;
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

      const stepInfo = stepInfos?.[nodeId];

      if (!isDefined(stepInfo)) {
        return {
          ...node,
          data: {
            ...node.data,
            runStatus: StepStatus.NOT_STARTED,
          },
        };
      }

      const nodeData = {
        ...node.data,
        runStatus: stepInfo.status,
      };

      if (!isDefined(stepToOpenByDefault) && stepInfo.status === 'PENDING') {
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

    const stepInfo = stepInfos?.[parentNode.id];

    if (!isDefined(stepInfo)) {
      return edge;
    }

    if (stepInfo.status === 'SUCCESS') {
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
