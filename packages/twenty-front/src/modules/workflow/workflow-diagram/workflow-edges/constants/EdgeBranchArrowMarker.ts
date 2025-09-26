enum EdgeBranchArrowState {
  Default = 'Default',
  Hover = 'Hover',
  Selected = 'Selected',
  Reconnecting = 'Reconnecting',
}

export const EDGE_BRANCH_ARROW_MARKER: Record<
  EdgeBranchArrowState,
  { markerEnd: string; zIndex: number }
> = {
  [EdgeBranchArrowState.Default]: {
    markerEnd: 'edge-branch-arrow-default',
    zIndex: -2,
  },
  [EdgeBranchArrowState.Hover]: {
    markerEnd: 'edge-branch-arrow-hover',
    zIndex: -1,
  },
  [EdgeBranchArrowState.Selected]: {
    markerEnd: 'edge-branch-arrow-selected',
    zIndex: 0,
  },
  [EdgeBranchArrowState.Reconnecting]: {
    markerEnd: 'edge-branch-arrow-reconnecting',
    zIndex: 1,
  },
};
