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
            fill={theme.grayScale.gray25}
          />
        </marker>
      </defs>
    </svg>
  );
};
