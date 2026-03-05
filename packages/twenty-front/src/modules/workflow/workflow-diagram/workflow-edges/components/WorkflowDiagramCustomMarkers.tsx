import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const WorkflowDiagramCustomMarkers = () => {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <marker
          id={EDGE_BRANCH_ARROW_MARKER.Default.markerEnd}
          markerHeight={8}
          markerWidth={10}
          refX={5}
          refY={4}
        >
          <path
            d="M1.7915 1.38672H8.18311C8.57541 1.38705 8.81458 1.81852 8.60693 2.15137L5.41064 7.26465C5.21481 7.57798 4.75882 7.57798 4.56299 7.26465L1.3667 2.15137C1.15906 1.81841 1.39896 1.38672 1.7915 1.38672Z"
            stroke={resolveThemeVariable(themeCssVariables.border.color.strong)}
            fill={resolveThemeVariable(themeCssVariables.background.primary)}
          />
        </marker>

        <marker
          id={EDGE_BRANCH_ARROW_MARKER.Hover.markerEnd}
          markerHeight={8}
          markerWidth={10}
          refX={5}
          refY={4}
        >
          <path
            d="M1.7915 1.38672H8.18311C8.57541 1.38705 8.81458 1.81852 8.60693 2.15137L5.41064 7.26465C5.21481 7.57798 4.75882 7.57798 4.56299 7.26465L1.3667 2.15137C1.15906 1.81841 1.39896 1.38672 1.7915 1.38672Z"
            stroke={resolveThemeVariable(themeCssVariables.font.color.light)}
            fill={resolveThemeVariable(themeCssVariables.background.primary)}
          />
        </marker>

        <marker
          id={EDGE_BRANCH_ARROW_MARKER.Selected.markerEnd}
          markerHeight={8}
          markerWidth={10}
          refX={5}
          refY={4}
        >
          <path
            d="M1.7915 1.38672H8.18311C8.57541 1.38705 8.81458 1.81852 8.60693 2.15137L5.41064 7.26465C5.21481 7.57798 4.75882 7.57798 4.56299 7.26465L1.3667 2.15137C1.15906 1.81841 1.39896 1.38672 1.7915 1.38672Z"
            stroke={resolveThemeVariable(themeCssVariables.color.blue)}
            fill={resolveThemeVariable(themeCssVariables.background.primary)}
          />
        </marker>
      </defs>
    </svg>
  );
};
