import { type WorkflowVersion } from '@/workflow/types/Workflow';
import {
  type WorkflowDiagram,
  type WorkflowDiagramEdgeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { transformFilterNodesAsEdges } from '@/workflow/workflow-diagram/utils/transformFilterNodesAsEdges';
import { isDefined } from 'twenty-shared/utils';

const EMPTY_DIAGRAM: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

const getEdgeTypeToCreateByDefault = ({
  isEditable,
}: {
  isEditable: boolean;
}): WorkflowDiagramEdgeType => {
  return isEditable ? 'empty-filter--editable' : 'empty-filter--readonly';
};

export const getWorkflowVersionDiagram = ({
  workflowVersion,
  isWorkflowBranchEnabled,
  isEditable,
}: {
  workflowVersion: WorkflowVersion | undefined;
  isWorkflowBranchEnabled?: boolean;
  isEditable: boolean;
}): WorkflowDiagram => {
  if (!isDefined(workflowVersion)) {
    return EMPTY_DIAGRAM;
  }

  const diagram = generateWorkflowDiagram({
    trigger: workflowVersion.trigger ?? undefined,
    steps: workflowVersion.steps ?? [],
    getEdgeType: ({ incomingNode }) => {
      if (!isEditable) {
        // TODO: special design probably for iterators
        return 'empty-filter--readonly';
      }

      if (
        incomingNode?.data.nodeType === 'action' &&
        incomingNode.data.actionType === 'ITERATOR'
      ) {
        return 'iterator-completed--empty-filter--editable';
      }

      return 'empty-filter--editable';
    },
    isWorkflowBranchEnabled,
  });

  return transformFilterNodesAsEdges({
    nodes: diagram.nodes,
    edges: diagram.edges,
    getFilterEdgeType: ({ incomingNode }) => {
      if (!isEditable) {
        // TODO: special design probably for iterators
        return 'filter--readonly';
      }

      if (
        incomingNode?.data.nodeType === 'action' &&
        incomingNode.data.actionType === 'ITERATOR'
      ) {
        return 'iterator-completed--filter--editable';
      }

      return 'filter--editable';
    },
    isWorkflowBranchEnabled: isWorkflowBranchEnabled === true,
  });
};
