const LIVE_REGION_MARKER_RESET_WAIT = 250;

export const waitForLiveRegionMarkerReset = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, LIVE_REGION_MARKER_RESET_WAIT));
