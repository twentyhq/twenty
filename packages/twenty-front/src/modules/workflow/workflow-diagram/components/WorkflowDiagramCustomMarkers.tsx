import { EDGE_GRAY_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGrayCircleMarkedId';
import { EDGE_GREEN_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenCircleMarkedId';
import { EDGE_GREEN_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerId';
import { EDGE_GREEN_ROUNDED_ARROW_MARKER_WIDTH_PX } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerWidthPx';
import { EDGE_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeRoundedArrowMarkerId';
import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
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
          markerHeight={NODE_HANDLE_HEIGHT_PX}
          markerWidth={NODE_HANDLE_WIDTH_PX}
          refX={NODE_HANDLE_WIDTH_PX / 2}
          refY={NODE_HANDLE_HEIGHT_PX}
          id={EDGE_GRAY_CIRCLE_MARKED_ID}
        >
          <rect
            height={NODE_HANDLE_HEIGHT_PX}
            width={NODE_HANDLE_WIDTH_PX}
            rx="2"
            fill={theme.border.color.strong}
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
