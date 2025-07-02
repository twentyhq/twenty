import {
  WorkflowRun,
  WorkflowRunOutputStepsOutput,
  WorkflowRunRunContext,
} from '@/workflow/types/Workflow';
import { WORKFLOW_VISUALIZER_EDGE_SUCCESS_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeSuccessConfiguration';
import {
  WorkflowDiagram,
  WorkflowDiagramRunStatus,
  WorkflowRunDiagram,
  WorkflowRunDiagramNode,
  WorkflowRunDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { isStepNode } from '@/workflow/workflow-diagram/utils/isStepNode';
import { getWorkflowRunStepExecutionStatusFromContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepExecutionStatusFromContext';

const getWorkflowRunDiagramFromRunContext = ({
  workflowDiagram,
  runContext,
}: {
  workflowDiagram: WorkflowDiagram;
  runContext: WorkflowRunRunContext;
}) => {
  let stepToOpenByDefault:
    | {
        id: string;
        data: WorkflowRunDiagramStepNodeData;
      }
    | undefined = undefined;

  const workflowRunDiagramNodes: WorkflowRunDiagramNode[] =
    workflowDiagram.nodes.filter(isStepNode).map((node) => {
      const nodeData = {
        ...node.data,
        runStatus: getWorkflowRunStepExecutionStatusFromContext({
          workflowRunRunContext: runContext,
          stepId: node.id,
        }),
      };

      if (
        !isDefined(stepToOpenByDefault) &&
        runContext.stepInfos[node.id].status === 'PENDING'
      ) {
        stepToOpenByDefault = {
          id: node.id,
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
    nodes: workflowRunDiagramNodes,
    edges: workflowRunDiagramEdges,
    stepToOpenByDefault,
  };
};

// TODO: remove that method when ouput is migrated
const getWorkflowRunDiagramFromOutput = ({
  workflowDiagram,
  stepsOutput,
}: {
  workflowDiagram: WorkflowDiagram;
  stepsOutput: WorkflowRunOutputStepsOutput | undefined;
}) => {
  let skippedExecution = false;

  let stepToOpenByDefault:
    | {
        id: string;
        data: WorkflowRunDiagramStepNodeData;
      }
    | undefined = undefined;

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
    nodes: workflowRunDiagramNodes,
    edges: workflowRunDiagramEdges,
    stepToOpenByDefault,
  };
};

export const generateWorkflowRunDiagram = ({
  workflowRun,
}: {
  workflowRun: WorkflowRun;
}): {
  diagram: WorkflowRunDiagram;
  stepToOpenByDefault:
    | {
        id: string;
        data: WorkflowRunDiagramStepNodeData;
      }
    | undefined;
} => {
  const workflowRunOutput = workflowRun.output;

  if (!(isDefined(workflowRun) && isDefined(workflowRunOutput))) {
    throw new Error(
      'Cannot generate workflow run diagram from undefined workflowRun',
    );
  }

  const { trigger, steps } = workflowRunOutput.flow;
  const stepsOutput = workflowRunOutput.stepsOutput;

  const workflowDiagram = generateWorkflowDiagram({ trigger, steps });

  const result = isDefined(workflowRun.runContext)
    ? getWorkflowRunDiagramFromRunContext({
        workflowDiagram,
        runContext: workflowRun.runContext,
      })
    : getWorkflowRunDiagramFromOutput({
        workflowDiagram,
        stepsOutput,
      });

  return {
    diagram: {
      nodes: result.nodes,
      edges: result.edges,
    },
    stepToOpenByDefault: result.stepToOpenByDefault,
  };
};
