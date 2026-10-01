// Every stacking context created on top of the document's root one gets its z-index here, so it no longer has to be
// guessed from the dev console: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context
// TODO: add the other remaining components that can appear in the root stacking context
export enum RootStackingContextZIndices {
  LogConsole = 20,
  SidePanel = 21,
  SidePanelButton = 22,
  MobileNavigationBar = 23,
  DropdownPortalBelowModal = 38,
  RootModalBackDrop = 39,
  RootModal = 40,
  DropdownPortalAboveModal = 50,
  Dialog = 9999,
  WelcomeOverlay = 10000,
  Toaster = 10002,
  NotFound = 10001,
}
