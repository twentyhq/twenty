import { WorkflowVersion } from '@/workflow/types/Workflow';
import {
  WorkflowDiagram,
  WorkflowDiagramEdgeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';
import { transformFilterNodesAsEdges } from '@/workflow/workflow-diagram/utils/transformFilterNodesAsEdges';

const EMPTY_DIAGRAM: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

const getEdgeTypeToCreateByDefault = ({
  isWorkflowFilteringEnabled,
  isEditable,
}: {
  isWorkflowFilteringEnabled: boolean;
  isEditable: boolean;
}): WorkflowDiagramEdgeType => {
  if (isWorkflowFilteringEnabled) {
    return isEditable ? 'empty-filter--editable' : 'empty-filter--readonly';
  }

  return isEditable
    ? 'filtering-disabled--editable'
    : 'filtering-disabled--readonly';
};

export const getWorkflowVersionDiagram = ({
  workflowVersion,
  isWorkflowFilteringEnabled,
  isEditable,
}: {
  workflowVersion: WorkflowVersion | undefined;
  isWorkflowFilteringEnabled: boolean;
  isEditable: boolean;
}): WorkflowDiagram => {
  if (!isDefined(workflowVersion)) {
    return EMPTY_DIAGRAM;
  }

  const diagram = generateWorkflowDiagram({
    trigger: workflowVersion.trigger ?? undefined,
    steps: workflowVersion.steps ?? [],
    defaultEdgeType: getEdgeTypeToCreateByDefault({
      isWorkflowFilteringEnabled,
      isEditable,
    }),
  });

  return transformFilterNodesAsEdges({
    nodes: diagram.nodes,
    edges: diagram.edges,
    defaultFilterEdgeType: isEditable ? 'filter--editable' : 'filter--readonly',
  });
};
