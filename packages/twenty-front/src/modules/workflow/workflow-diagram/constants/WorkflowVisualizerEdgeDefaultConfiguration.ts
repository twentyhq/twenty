import { EDGE_BRANCH_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeBranchArrowMarkerId';
import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramEdgeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION = {
  type: 'empty-filter--readonly' satisfies WorkflowDiagramEdgeType,
  markerStart: undefined,
  markerEnd: EDGE_BRANCH_ARROW_MARKER_ID,
  deletable: false,
  selectable: false,
  data: {
    edgeType: 'default',
  },
} satisfies Partial<WorkflowDiagramEdge>;
