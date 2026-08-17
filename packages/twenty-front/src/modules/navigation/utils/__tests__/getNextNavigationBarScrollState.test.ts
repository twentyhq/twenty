import {
  getNextNavigationBarScrollState,
  INITIAL_NAVIGATION_BAR_SCROLL_STATE,
  type NavigationBarScrollState,
} from '@/navigation/utils/getNextNavigationBarScrollState';

const visibleAt = (accumulatedDeltaInPx: number): NavigationBarScrollState => ({
  accumulatedDeltaInPx,
  isVisible: true,
});

const hiddenAt = (accumulatedDeltaInPx: number): NavigationBarScrollState => ({
  accumulatedDeltaInPx,
  isVisible: false,
});

describe('getNextNavigationBarScrollState', () => {
  it('should keep the current state when the container is seen for the first time', () => {
    const currentState = visibleAt(0);

    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 800,
        lastScrollTopInPx: undefined,
        currentState,
      }),
    ).toEqual(currentState);
  });

  it('should keep the current state when the container did not move vertically', () => {
    const currentState = visibleAt(20);

    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 200,
        lastScrollTopInPx: 200,
        currentState,
      }),
    ).toEqual(currentState);
  });

  it('should hide once the accumulated downward scroll passes the threshold', () => {
    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 200,
        lastScrollTopInPx: 100,
        currentState: visibleAt(0),
      }),
    ).toEqual({ accumulatedDeltaInPx: 100, isVisible: false });
  });

  it('should stay visible while downward scrolls stay under the threshold', () => {
    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 110,
        lastScrollTopInPx: 100,
        currentState: visibleAt(0),
      }),
    ).toEqual({ accumulatedDeltaInPx: 10, isVisible: true });
  });

  it('should accumulate successive scrolls in the same direction', () => {
    const afterFirstScroll = getNextNavigationBarScrollState({
      scrollTopInPx: 115,
      lastScrollTopInPx: 100,
      currentState: visibleAt(0),
    });

    expect(afterFirstScroll).toEqual({
      accumulatedDeltaInPx: 15,
      isVisible: true,
    });

    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 130,
        lastScrollTopInPx: 115,
        currentState: afterFirstScroll,
      }),
    ).toEqual({ accumulatedDeltaInPx: 30, isVisible: false });
  });

  it('should restart the accumulator when the scroll direction changes', () => {
    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 195,
        lastScrollTopInPx: 200,
        currentState: hiddenAt(100),
      }),
    ).toEqual({ accumulatedDeltaInPx: -5, isVisible: false });
  });

  it('should show again once the accumulated upward scroll passes the threshold', () => {
    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 100,
        lastScrollTopInPx: 200,
        currentState: hiddenAt(100),
      }),
    ).toEqual({ accumulatedDeltaInPx: -100, isVisible: true });
  });

  it('should reset to the initial state near the top of the container', () => {
    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 0,
        lastScrollTopInPx: 200,
        currentState: hiddenAt(100),
      }),
    ).toEqual(INITIAL_NAVIGATION_BAR_SCROLL_STATE);
  });

  // The accumulator is what a route change or a side panel transition resets,
  // so a small scroll on the next view must not inherit the previous direction.
  it('should require the full threshold again from the initial state', () => {
    expect(
      getNextNavigationBarScrollState({
        scrollTopInPx: 210,
        lastScrollTopInPx: 200,
        currentState: INITIAL_NAVIGATION_BAR_SCROLL_STATE,
      }),
    ).toEqual({ accumulatedDeltaInPx: 10, isVisible: true });
  });
});
