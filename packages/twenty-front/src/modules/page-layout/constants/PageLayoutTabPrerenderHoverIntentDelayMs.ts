// Sweeping the cursor across the tab bar should not prerender every tab it
// crosses; only a pause long enough to signal intent triggers the mount.
export const PAGE_LAYOUT_TAB_PRERENDER_HOVER_INTENT_DELAY_MS = 100;
