// A button with a hot key is measured with and without its hint, so the hint
// can give way before the button does
export const getPinnedCommandMenuItemWidthKey = ({
  commandMenuItemId,
  shouldShowHotKey,
}: {
  commandMenuItemId: string;
  shouldShowHotKey: boolean;
}) =>
  shouldShowHotKey ? commandMenuItemId : `${commandMenuItemId}-without-hot-key`;
