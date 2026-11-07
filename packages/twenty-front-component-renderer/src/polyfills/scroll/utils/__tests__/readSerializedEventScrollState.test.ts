import { readSerializedEventScrollState } from '@/polyfills/scroll/utils/readSerializedEventScrollState';

describe('readSerializedEventScrollState', () => {
  it('should pick only the scroll state from the serialized event', () => {
    expect(
      readSerializedEventScrollState({
        type: 'scroll',
        bubbles: false,
        targetRemoteElementId: '7',
        scrollTop: 120,
        scrollLeft: -40,
        scrollWidth: 900,
        clientWidth: 300,
        clientX: 12,
        deltaY: 3,
      }),
    ).toEqual({
      scrollTop: 120,
      scrollLeft: -40,
      scrollWidth: 900,
      clientWidth: 300,
    });
  });

  it('should keep a zero scroll offset', () => {
    expect(
      readSerializedEventScrollState({ type: 'scroll', scrollTop: 0 }),
    ).toEqual({ scrollTop: 0 });
  });

  it('should skip values that are not finite numbers', () => {
    expect(
      readSerializedEventScrollState({
        type: 'scroll',
        scrollLeft: Number.NaN,
        scrollWidth: 640,
      }),
    ).toEqual({ scrollWidth: 640 });
  });

  it('should return null when the event carries no scroll state', () => {
    expect(
      readSerializedEventScrollState({
        type: 'wheel',
        deltaX: 4,
        deltaY: 12,
      }),
    ).toBeNull();
  });

  it('should return null when every scroll value is invalid', () => {
    expect(
      readSerializedEventScrollState({
        type: 'scroll',
        scrollTop: Number.NaN,
      }),
    ).toBeNull();
  });
});
