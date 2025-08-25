import { EdgeBranchArrowMarker } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramEdgeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION = {
  type: 'empty-filter--readonly' satisfies WorkflowDiagramEdgeType,
  markerStart: undefined,
  markerEnd: EdgeBranchArrowMarker.Default,
  deletable: false,
  selectable: false,
  data: {
    edgeType: 'default',
  },
} satisfies Partial<WorkflowDiagramEdge>;
