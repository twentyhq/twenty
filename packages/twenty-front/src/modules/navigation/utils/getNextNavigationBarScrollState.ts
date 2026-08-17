import { isDefined } from 'twenty-shared/utils';

const SCROLL_DELTA_TO_TOGGLE_IN_PX = 24;
const SCROLL_TOP_ALWAYS_VISIBLE_IN_PX = 8;

export type NavigationBarScrollState = {
  accumulatedDeltaInPx: number;
  isVisible: boolean;
};

type GetNextNavigationBarScrollStateParams = {
  scrollTopInPx: number;
  lastScrollTopInPx: number | undefined;
  currentState: NavigationBarScrollState;
};

export const INITIAL_NAVIGATION_BAR_SCROLL_STATE: NavigationBarScrollState = {
  accumulatedDeltaInPx: 0,
  isVisible: true,
};

export const getNextNavigationBarScrollState = ({
  scrollTopInPx,
  lastScrollTopInPx,
  currentState,
}: GetNextNavigationBarScrollStateParams): NavigationBarScrollState => {
  // A container restoring its scroll position would otherwise read as a jump
  // down from 0 the first time it is seen.
  if (!isDefined(lastScrollTopInPx)) {
    return currentState;
  }

  const deltaInPx = scrollTopInPx - lastScrollTopInPx;

  // A horizontal scroll fires the same event without moving the container
  // vertically, so it has to leave the accumulated direction alone.
  if (deltaInPx === 0) {
    return currentState;
  }

  if (scrollTopInPx <= SCROLL_TOP_ALWAYS_VISIBLE_IN_PX) {
    return INITIAL_NAVIGATION_BAR_SCROLL_STATE;
  }

  const hasDirectionChanged =
    Math.sign(currentState.accumulatedDeltaInPx) !== Math.sign(deltaInPx);

  const accumulatedDeltaInPx = hasDirectionChanged
    ? deltaInPx
    : currentState.accumulatedDeltaInPx + deltaInPx;

  if (accumulatedDeltaInPx > SCROLL_DELTA_TO_TOGGLE_IN_PX) {
    return { accumulatedDeltaInPx, isVisible: false };
  }

  if (accumulatedDeltaInPx < -SCROLL_DELTA_TO_TOGGLE_IN_PX) {
    return { accumulatedDeltaInPx, isVisible: true };
  }

  return { accumulatedDeltaInPx, isVisible: currentState.isVisible };
};
