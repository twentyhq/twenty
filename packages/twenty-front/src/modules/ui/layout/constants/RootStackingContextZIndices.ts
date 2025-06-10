/**
 * Please read this article to understand why we use this enum : https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context
 *
 * It is important to keep track of the stacking contexts that are created on top of the root stacking context of the document.
 *
 * Right now we have to guess it by looking into the developer console
 *
 * This way we can avoid hazardous fidgeting with z-index CSS properties
 *   and having to look down the tree in the developer console to see which component is in the root stacking context or not
 *
 * Using an enum enforces a single z-index for each component in the root stacking context
 *
 * TODO: add the other remaining components that can appear in the root stacking context
 */
export enum RootStackingContextZIndices {
  CommandMenu = 21,
  CommandMenuButton = 22,
  DropdownPortalBelowModal = 38,
  RootModalBackDrop = 39,
  RootModal = 40,
  DropdownPortalAboveModal = 50,
  Dialog = 9999,
  SnackBar = 10002,
  NotFound = 10001,
}
