import { EDGE_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeRoundedArrowMarkerId';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION = {
  markerEnd: EDGE_ROUNDED_ARROW_MARKER_ID,
  deletable: false,
  selectable: false,
} satisfies Partial<WorkflowDiagramEdge>;
