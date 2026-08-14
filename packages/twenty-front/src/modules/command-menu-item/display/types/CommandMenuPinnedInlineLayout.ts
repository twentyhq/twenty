export type CommandMenuPinnedInlineLayout = {
  containerWidth: number;
  // Width of the leading action sharing the measured container with the pinned
  // items, reserved by the inline-fit calculation so it never over-counts.
  leadingActionWidth: number;
  commandMenuItemWidthsByKey: Record<string, number>;
};
