import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramEdgeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';

export const WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION = {
  type: 'readonly' satisfies WorkflowDiagramEdgeType,
  markerStart: undefined,
  ...EDGE_BRANCH_ARROW_MARKER.Default,
  deletable: false,
  selectable: false,
  data: {
    edgeType: 'default',
  },
} satisfies Partial<WorkflowDiagramEdge>;
