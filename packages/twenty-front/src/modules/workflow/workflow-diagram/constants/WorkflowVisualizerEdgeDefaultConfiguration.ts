import { EDGE_GRAY_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGrayCircleMarkedId';
import { EDGE_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeRoundedArrowMarkerId';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeType,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION = {
  type: 'empty-filter--readonly' satisfies WorkflowDiagramEdgeType,
  markerStart: EDGE_GRAY_CIRCLE_MARKED_ID,
  markerEnd: EDGE_ROUNDED_ARROW_MARKER_ID,
  deletable: false,
  selectable: false,
  data: {
    edgeType: 'default',
  },
} satisfies Partial<WorkflowDiagramEdge>;
