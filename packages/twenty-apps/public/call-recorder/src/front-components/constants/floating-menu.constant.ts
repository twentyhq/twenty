export const FLOATING_MENU_GAP_PIXELS = 4;

export const FLOATING_MENU_VIEWPORT_MARGIN_PIXELS = 8;

export const FLOATING_MENU_MAX_HEIGHT_PIXELS = 320;

export const FLOATING_MENU_DEFAULT_WIDTH_PIXELS = 200;

// The worker is handed fresh geometry snapshots but never a scroll or resize
// event, so an open menu re-measures its anchor on a timer instead.
export const FLOATING_MENU_REPOSITION_INTERVAL_MILLISECONDS = 150;
