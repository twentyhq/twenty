import { EDGE_BRANCH_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeBranchArrowMarkerId';
import { EDGE_GREEN_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenCircleMarkedId';
import { EDGE_GREEN_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerId';
import { EDGE_GREEN_ROUNDED_ARROW_MARKER_WIDTH_PX } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerWidthPx';
import { EDGE_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeRoundedArrowMarkerId';
import { useTheme } from '@emotion/react';

export const WorkflowDiagramCustomMarkers = () => {
  const theme = useTheme();

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <marker
          id={EDGE_ROUNDED_ARROW_MARKER_ID}
          markerHeight={5}
          markerWidth={6}
          refX={3}
          refY={2.5}
        >
          <path
            d="M0.31094 1.1168C0.178029 0.917434 0.320947 0.650391 0.560555 0.650391H5.43945C5.67905 0.650391 5.82197 0.917434 5.68906 1.1168L3.62404 4.21433C3.32717 4.65963 2.67283 4.65963 2.37596 4.21433L0.31094 1.1168Z"
            fill={theme.border.color.strong}
          />
        </marker>

        <marker
          id={EDGE_GREEN_ROUNDED_ARROW_MARKER_ID}
          markerHeight={5}
          markerWidth={EDGE_GREEN_ROUNDED_ARROW_MARKER_WIDTH_PX}
          refX={EDGE_GREEN_ROUNDED_ARROW_MARKER_WIDTH_PX / 2}
          refY={2.5}
        >
          <path
            d="M0.31094 1.1168C0.178029 0.917434 0.320947 0.650391 0.560555 0.650391H5.43945C5.67905 0.650391 5.82197 0.917434 5.68906 1.1168L3.62404 4.21433C3.32717 4.65963 2.67283 4.65963 2.37596 4.21433L0.31094 1.1168Z"
            fill={theme.tag.text.turquoise}
          />
        </marker>

        <marker
          id={EDGE_BRANCH_ARROW_MARKER_ID}
          markerHeight={8}
          markerWidth={10}
          refX={5}
          refY={4}
        >
          <path
            d="M1.7915 1.38672H8.18311C8.57541 1.38705 8.81458 1.81852 8.60693 2.15137L5.41064 7.26465C5.21481 7.57798 4.75882 7.57798 4.56299 7.26465L1.3667 2.15137C1.15906 1.81841 1.39896 1.38672 1.7915 1.38672Z"
            stroke={theme.border.color.strong}
            fill={theme.background.primary}
          />
        </marker>

        <marker
          markerHeight={5}
          markerWidth={5}
          refX={2}
          refY={2.5}
          id={EDGE_GREEN_CIRCLE_MARKED_ID}
        >
          <rect
            x={0.5}
            y={0.5}
            height={3}
            width={3}
            rx="1.5"
            fill="white"
            stroke={theme.tag.text.turquoise}
            strokeWidth={1}
          />
        </marker>
      </defs>
    </svg>
  );
};
