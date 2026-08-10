// A side panel page declares how it expands into its full page equivalent.
// `expand` is deliberately opaque so a page can navigate to a route, open a
// full screen overlay, or anything else, without the top bar knowing.
export type SidePanelExpandTarget = {
  label: string;
  expand: () => void;
};
