import {
  WorkflowRunOutput,
  WorkflowStep,
  WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import { WORKFLOW_VISUALIZER_EDGE_SUCCESS_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeSuccessConfiguration';
import {
  WorkflowDiagramRunStatus,
  WorkflowDiagramStepNodeData,
  WorkflowRunDiagram,
  WorkflowRunDiagramEdge,
  WorkflowRunDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { isDefined } from 'twenty-shared';
import { v4 } from 'uuid';

export const generateWorkflowRunDiagram = ({
  trigger,
  steps,
  output,
}: {
  trigger: WorkflowTrigger;
  steps: Array<WorkflowStep>;
  output: WorkflowRunOutput | null;
}): WorkflowRunDiagram => {
  const triggerBase = getWorkflowDiagramTriggerNode({ trigger });

  const nodes: Array<WorkflowRunDiagramNode> = [
    {
      ...triggerBase,
      data: {
        ...triggerBase.data,
        runStatus: 'success',
      },
    },
  ];
  const edges: Array<WorkflowRunDiagramEdge> = [];

  const processNode = ({
    stepIndex,
    parentNodeId,
    parentRunStatus,
    xPos,
    yPos,
    skippedExecution,
  }: {
    stepIndex: number;
    parentNodeId: string;
    parentRunStatus: WorkflowDiagramRunStatus;
    xPos: number;
    yPos: number;
    skippedExecution: boolean;
  }) => {
    const step = steps.at(stepIndex);
    if (!isDefined(step)) {
      return;
    }

    const nodeId = step.id;

    if (parentRunStatus === 'success') {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_SUCCESS_CONFIGURATION,
        id: v4(),
        source: parentNodeId,
        target: nodeId,
      });
    } else {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        id: v4(),
        source: parentNodeId,
        target: nodeId,
      });
    }

    const runResult = output?.steps[nodeId];

    let runStatus: WorkflowDiagramRunStatus;
    if (skippedExecution) {
      runStatus = 'not-executed';
    } else if (!isDefined(runResult)) {
      runStatus = 'running';
    } else {
      const lastAttempt = runResult.outputs.at(-1);

      if (!isDefined(lastAttempt)) {
        // Should never happen. Should we throw instead?
        runStatus = 'failure';
      } else if (isDefined(lastAttempt.error)) {
        runStatus = 'failure';
      } else {
        runStatus = 'success';
      }
    }

    nodes.push({
      id: nodeId,
      data: {
        nodeType: 'action',
        actionType: step.type,
        name: step.name,
        isLeafNode: false,
        runStatus,
      } satisfies WorkflowDiagramStepNodeData,
      position: {
        x: xPos,
        y: yPos,
      },
    });

    processNode({
      stepIndex: stepIndex + 1,
      parentNodeId: nodeId,
      parentRunStatus: runStatus,
      xPos,
      yPos: yPos + 150,
      skippedExecution: runStatus === 'failure' || runStatus === 'running',
    });
  };

  processNode({
    stepIndex: 0,
    parentNodeId: TRIGGER_STEP_ID,
    parentRunStatus: 'success',
    xPos: 150,
    yPos: 100,
    skippedExecution: false,
  });

  return {
    nodes,
    edges,
  };
};
