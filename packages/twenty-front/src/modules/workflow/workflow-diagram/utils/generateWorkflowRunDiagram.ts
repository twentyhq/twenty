import {
  type WorkflowStep,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import {
  type WorkflowDiagramEdgeData,
  type WorkflowDiagramEdgeType,
  type WorkflowRunDiagram,
  type WorkflowRunDiagramNode,
  type WorkflowRunDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { isStepNode } from '@/workflow/workflow-diagram/utils/isStepNode';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

const shouldOpenStep = ({
  nodeId,
  steps,
  stepInfos,
}: {
  nodeId: string;
  steps: Array<WorkflowStep>;
  stepInfos: WorkflowRunStepInfos | undefined;
}) => {
  const step = steps.find((step) => step.id === nodeId);
  const stepInfo = stepInfos?.[nodeId];
  const isStepPending = isDefined(stepInfo) && stepInfo.status === 'PENDING';
  const isStepOpenable = isDefined(step) && ['FORM'].includes(step.type);

  return isStepPending && isStepOpenable;
};

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

  const workflowDiagram = generateWorkflowDiagram({
    trigger,
    steps,
    workflowContext: 'workflow-run',
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

      if (
        !isDefined(stepToOpenByDefault) &&
        shouldOpenStep({ nodeId, stepInfos, steps })
      ) {
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

    return {
      ...edge,
      type: 'readonly' satisfies WorkflowDiagramEdgeType,
      data: {
        ...edge.data,
        edgeType: 'default',
        edgeExecutionStatus: stepInfo?.status ?? StepStatus.NOT_STARTED,
      } satisfies WorkflowDiagramEdgeData,
    };
  });

  return {
    diagram: {
      nodes: workflowRunDiagramNodes,
      edges: workflowRunDiagramEdges,
    },
    stepToOpenByDefault,
  };
};
