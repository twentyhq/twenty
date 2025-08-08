import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import {
  WorkflowDiagramEdgeData,
  WorkflowDiagramEdgeType,
  WorkflowRunDiagram,
  WorkflowRunDiagramNode,
  WorkflowRunDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { isStepNode } from '@/workflow/workflow-diagram/utils/isStepNode';
import { transformFilterNodesAsEdges } from '@/workflow/workflow-diagram/utils/transformFilterNodesAsEdges';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, WorkflowRunStepInfos } from 'twenty-shared/workflow';

export const generateWorkflowRunDiagram = ({
  trigger,
  steps,
  stepInfos,
  isWorkflowFilteringEnabled,
}: {
  trigger: WorkflowTrigger;
  steps: Array<WorkflowStep>;
  stepInfos: WorkflowRunStepInfos | undefined;
  isWorkflowFilteringEnabled: boolean;
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

  const workflowDiagram = generateWorkflowDiagram({
    trigger,
    steps,
    defaultEdgeType: 'filtering-disabled--readonly',
  });

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
      throw new Error('Expected the edge to have a parent node');
    }

    const stepInfo = stepInfos?.[parentNode.id];

    const edgeType: WorkflowDiagramEdgeType = isWorkflowFilteringEnabled
      ? 'empty-filter--run'
      : 'filtering-disabled--run';

    return {
      ...edge,
      type: edgeType,
      data: {
        ...edge.data,
        edgeType: 'default',
        edgeExecutionStatus: stepInfo?.status ?? StepStatus.NOT_STARTED,
      } satisfies WorkflowDiagramEdgeData,
    };
  });

  if (!isWorkflowFilteringEnabled) {
    return {
      diagram: {
        nodes: workflowRunDiagramNodes,
        edges: workflowRunDiagramEdges,
      },
      stepToOpenByDefault,
    };
  }

  return {
    diagram: transformFilterNodesAsEdges({
      nodes: workflowRunDiagramNodes,
      edges: workflowRunDiagramEdges,
      defaultFilterEdgeType: 'filter--run',
    }),
    stepToOpenByDefault,
  };
};
