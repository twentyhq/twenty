// `expand` is opaque so a page can navigate, open an overlay or anything else without the top bar knowing
export type SidePanelExpandTarget = {
  label: string;
  disabledReason?: string;
  expand: () => void;
  // Pages whose content owns cmd+enter, such as a composer, decline it.
  hasExpandShortcut: boolean;
};
